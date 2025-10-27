import type { NextApiRequest, NextApiResponse } from 'next';
import { mintCouponNft } from '@/lib/metaplex';
import { recordDeal } from '@/lib/deals';
import { MintDealRequestPayload, MintResponse } from '@/types';
import { createNonce } from '@/lib/qr';

const handler = async (req: NextApiRequest, res: NextApiResponse<MintResponse>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { title, description, discount, supply, expiresAt, imageUrl, tags, merchantAddress } = req.body as MintDealRequestPayload;

  if (!title || !description || !discount || !supply || !expiresAt || !merchantAddress) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const nft = await mintCouponNft({
      name: title,
      description,
      discount,
      supply,
      expiresAt,
      imageUrl: imageUrl ?? '',
      tags
    });

    const mintAddress = nft.mint.address.toBase58();
    const dealId = `deal-${createNonce(6)}`;

    await recordDeal({
      id: dealId,
      title,
      description,
      discount,
      merchantAddress,
      imageUrl,
      nftMint: mintAddress,
      supply,
      remaining: supply,
      expiresAt,
      status: 'active',
      tags
    });

    return res.status(200).json({ success: true, mintAddress });
  } catch (error) {
    console.error('Mint API failed', error);
    return res.status(500).json({ success: false, error: 'Failed to mint NFT coupon' });
  }
};

export default handler;
