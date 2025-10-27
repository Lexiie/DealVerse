import type { NextApiRequest, NextApiResponse } from 'next';
import { decodeQrPayload, isQrPayloadValid } from '@/lib/qr';
import { verifyCouponOwnership } from '@/lib/solana';
import { recordRedemption } from '@/lib/deals';
import { RedeemResponse } from '@/types';
import { requireSupabase } from '@/lib/supabase';
import { REDEMPTIONS_TABLE } from '@/utils/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse<RedeemResponse>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { encodedPayload } = req.body as { encodedPayload?: string };

  if (!encodedPayload) {
    return res.status(400).json({ success: false, error: 'Missing encoded payload' });
  }

  try {
    const payload = decodeQrPayload(encodedPayload);
    if (!isQrPayloadValid(payload)) {
      return res.status(400).json({ success: false, error: 'QR payload is invalid or expired' });
    }

    const supabase = requireSupabase();

    const { data: existingRedemption } = await supabase
      .from(REDEMPTIONS_TABLE)
      .select('id')
      .eq('nonce', payload.nonce)
      .maybeSingle();

    if (existingRedemption) {
      return res.status(409).json({ success: false, error: 'Coupon already redeemed' });
    }

    const ownsCoupon = await verifyCouponOwnership({ owner: payload.owner, mint: payload.couponMint });

    if (!ownsCoupon) {
      return res.status(403).json({ success: false, error: 'Wallet does not own coupon NFT' });
    }

    await recordRedemption({
      dealId: payload.dealId,
      walletAddress: payload.owner,
      mintAddress: payload.couponMint,
      nonce: payload.nonce
    });

    // TODO: Optionally invoke on-chain redeem program for immutable logging.

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Redeem API failed', error);
    return res.status(500).json({ success: false, error: 'Failed to redeem coupon' });
  }
};

export default handler;
