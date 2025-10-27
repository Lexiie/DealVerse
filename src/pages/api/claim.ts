import type { NextApiRequest, NextApiResponse } from 'next';
import { encodeQrPayload, createQrPayload } from '@/lib/qr';
import { ClaimRequestPayload, ClaimResponse } from '@/types';
import { findClaimByWallet, getDealById, recordClaim, registerRedeemNonce } from '@/lib/deals';

export const config = { runtime: 'nodejs' };

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

    if (new Date(deal.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Deal has expired' });
    }

    if (deal.remaining <= 0) {
      return res.status(400).json({ success: false, message: 'Deal is sold out' });
    }

    const existingClaim = await findClaimByWallet(dealId, walletAddress);

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

    const qrPayload = createQrPayload({
      dealId,
      couponMint: deal.nftMint,
      owner: walletAddress
    });

    await registerRedeemNonce({
      mint: qrPayload.couponMint,
      nonce: qrPayload.nonce,
      expiresAt: qrPayload.expiresAt
    });

    return res.status(200).json({
      success: true,
      message: 'Coupon claimed',
      encodedPayload: encodeQrPayload(qrPayload)
    });
  } catch (error) {
    console.error('Claim API failed', error);
    return res.status(500).json({ success: false, message: 'Failed to claim deal' });
  }
};

export default handler;
