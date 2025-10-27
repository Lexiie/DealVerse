import type { NextApiRequest, NextApiResponse } from 'next';
import { listDeals } from '@/lib/deals';
import { Deal } from '@/types';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/utils/constants';

const fallbackDeals: Deal[] = [
  {
    id: 'sample-001',
    title: 'Sample Gelato Happy Hour',
    description: 'Unlock 20% off any two scoops at participating stores.',
    discount: '20% OFF',
    merchantAddress: 'SampleMerchant111111111111111111111111111',
    imageUrl: 'https://images.unsplash.com/photo-1509460913899-515f1df34fea',
    nftMint: undefined,
    supply: 250,
    remaining: 250,
    expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    tags: ['Food', 'Dessert']
  }
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(200).json(fallbackDeals);
  }

  try {
    const deals = await listDeals();
    return res.status(200).json(deals);
  } catch (error) {
    console.error('Failed to fetch deals', error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

export default handler;
