import type { NextApiRequest, NextApiResponse } from 'next';
import { mintCouponNft } from '@/lib/metaplex';
import { recordDeal } from '@/lib/deals';
import { MintDealRequestPayload, MintResponse } from '@/types';

export const config = { runtime: 'nodejs' };

const handler = async (req: NextApiRequest, res: NextApiResponse<MintResponse>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const {
    title,
    description,
    discount,
    supply,
    expiresAt,
    imageUrl,
    tags,
    merchantAddress,
    preprovidedUri
  } = req.body as MintDealRequestPayload;

  if (!title || !discount || !supply || !expiresAt || !merchantAddress) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const numericDiscount = Number(discount);
  if (!Number.isFinite(numericDiscount) || numericDiscount < 1 || numericDiscount > 100) {
    return res.status(400).json({ success: false, error: 'Discount must be between 1 and 100' });
  }

  const numericSupply = Number(supply);
  if (!Number.isFinite(numericSupply) || numericSupply < 1) {
    return res.status(400).json({ success: false, error: 'Supply must be at least 1' });
  }

  const expiryIso = new Date(expiresAt).toISOString();
  if (Number.isNaN(Date.parse(expiryIso))) {
    return res.status(400).json({ success: false, error: 'Invalid expiry date' });
  }

  try {
    const { nft, uri } = await mintCouponNft({
      name: title,
      description,
      discount: numericDiscount,
      supply: numericSupply,
      expiresAt: expiryIso,
      imageUrl,
      tags,
      preprovidedUri
    });

    const mintAddress = nft.mint.address.toBase58();
    const deal = await recordDeal({
      title,
      description,
      discount: numericDiscount,
      imageUrl,
      tags,
      merchantAddress,
      nftMint: mintAddress,
      supply: numericSupply,
      expiresAt: expiryIso
    });

    return res.status(200).json({ success: true, mintAddress, dealId: deal.id, uri });
  } catch (error) {
    console.error('Mint API failed', error);
    const message = error instanceof Error ? error.message : 'Failed to mint NFT coupon';
    return res.status(500).json({ success: false, error: message });
  }
};

export default handler;
