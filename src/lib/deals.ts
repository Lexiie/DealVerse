import { requireSupabase } from './supabase';
import { Deal } from '@/types';
import { CLAIMS_TABLE, DEALS_TABLE, REDEMPTIONS_TABLE } from '@/utils/constants';

export type DealRecord = Deal & {
  created_at?: string;
};

export const listDeals = async (): Promise<Deal[]> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from<DealRecord>(DEALS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((deal) => ({
    ...deal,
    status: deal.status ?? 'active'
  }));
};

export const getDealById = async (dealId: string) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from<DealRecord>(DEALS_TABLE)
    .select('*')
    .eq('id', dealId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const recordDeal = async (deal: DealRecord) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from<DealRecord>(DEALS_TABLE)
    .upsert(deal, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateDealSupply = async (dealId: string, remaining: number) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from<DealRecord>(DEALS_TABLE)
    .update({ remaining })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const recordClaim = async ({
  dealId,
  walletAddress,
  mintAddress
}: {
  dealId: string;
  walletAddress: string;
  mintAddress: string;
}) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from(CLAIMS_TABLE)
    .insert({ deal_id: dealId, wallet_address: walletAddress, mint_address: mintAddress })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const recordRedemption = async ({
  dealId,
  walletAddress,
  mintAddress,
  nonce
}: {
  dealId: string;
  walletAddress: string;
  mintAddress: string;
  nonce: string;
}) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from(REDEMPTIONS_TABLE)
    .insert({ deal_id: dealId, wallet_address: walletAddress, mint_address: mintAddress, nonce })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
