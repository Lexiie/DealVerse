import type { NextApiRequest, NextApiResponse } from 'next';
import { encodeQrPayload, createQrPayload } from '@/lib/qr';
import { getDealById, recordClaim, updateDealSupply } from '@/lib/deals';
import { ClaimRequestPayload, ClaimResponse } from '@/types';
import { requireSupabase } from '@/lib/supabase';
import { CLAIMS_TABLE } from '@/utils/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse<ClaimResponse>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { dealId, walletAddress } = req.body as ClaimRequestPayload;

  if (!dealId || !walletAddress) {
    return res.status(400).json({ success: false, message: 'Missing dealId or walletAddress' });
  }

  try {
    const deal = await getDealById(dealId);

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    if (deal.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Deal is not active' });
    }

    if (deal.remaining <= 0) {
      return res.status(400).json({ success: false, message: 'Deal is sold out' });
    }

    if (new Date(deal.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Deal has expired' });
    }

    const supabase = requireSupabase();
    const { data: existingClaim } = await supabase
      .from(CLAIMS_TABLE)
      .select('id')
      .eq('deal_id', dealId)
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (existingClaim) {
      return res.status(409).json({ success: false, message: 'Wallet already claimed this deal' });
    }

    if (!deal.nftMint) {
      return res.status(500).json({ success: false, message: 'Deal mint address missing' });
    }

    await recordClaim({
      dealId,
      walletAddress,
      mintAddress: deal.nftMint
    });

    await updateDealSupply(dealId, deal.remaining - 1);

    const encodedPayload = encodeQrPayload(
      createQrPayload({
        dealId,
        couponMint: deal.nftMint,
        owner: walletAddress
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Coupon claimed',
      encodedPayload
    });
  } catch (error) {
    console.error('Claim API failed', error);
    return res.status(500).json({ success: false, message: 'Failed to claim deal' });
  }
};

export default handler;
