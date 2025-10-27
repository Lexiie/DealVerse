import { randomUUID } from 'crypto';
import { getServiceSupabase } from './supabase';
import { Deal, DealStatus } from '@/types';
import { DEALS_TABLE, MINTS_TABLE, REDEEM_NONCE_TABLE } from '@/utils/constants';

type DealRow = {
  id: string;
  merchant: string;
  title: string;
  description?: string;
  discount: number;
  image_url?: string;
  tags?: string[];
  nft_mint?: string;
  total_supply: number;
  expiry: string;
  created_at?: string;
};

type MintRow = {
  deal_id: string;
  mint: string;
  owner: string;
  used: boolean;
  used_at: string | null;
};

type RedeemNonceRow = {
  mint: string;
  nonce: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
};

const computeStatus = (remaining: number, expiry: string): DealStatus => {
  if (Date.now() >= new Date(expiry).getTime()) {
    return 'expired';
  }
  if (remaining <= 0) {
    return 'sold_out';
  }
  return 'active';
};

const mapDealRow = (row: DealRow, claimed: number): Deal => {
  const remaining = Math.max(row.total_supply - claimed, 0);

  return {
    id: row.id,
    title: row.title,
    merchant: row.merchant,
    description: row.description ?? undefined,
    discount: row.discount,
    imageUrl: row.image_url ?? undefined,
    tags: row.tags ?? undefined,
    nftMint: row.nft_mint ?? undefined,
    totalSupply: row.total_supply,
    claimed,
    remaining,
    expiresAt: row.expiry,
    status: computeStatus(remaining, row.expiry)
  };
};

const loadClaimCounts = async (dealIds: string[]) => {
  if (dealIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from<Pick<MintRow, 'deal_id'>>(MINTS_TABLE)
    .select('deal_id')
    .in('deal_id', dealIds);

  if (error) {
    throw error;
  }

  const counts = new Map<string, number>();
  (data ?? []).forEach(({ deal_id }) => {
    counts.set(deal_id, (counts.get(deal_id) ?? 0) + 1);
  });

  return counts;
};

export const listDeals = async (): Promise<Deal[]> => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from<DealRow>(DEALS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const counts = await loadClaimCounts(rows.map((row) => row.id));

  return rows.map((row) => mapDealRow(row, counts.get(row.id) ?? 0));
};

export const getDealById = async (dealId: string): Promise<Deal | null> => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from<DealRow>(DEALS_TABLE)
    .select('*')
    .eq('id', dealId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const counts = await loadClaimCounts([data.id]);
  return mapDealRow(data, counts.get(data.id) ?? 0);
};

export const recordDeal = async ({
  title,
  description,
  discount,
  imageUrl,
  tags,
  merchantAddress,
  nftMint,
  supply,
  expiresAt
}: {
  title: string;
  description?: string;
  discount: number;
  imageUrl?: string;
  tags?: string[];
  merchantAddress: string;
  nftMint: string;
  supply: number;
  expiresAt: string;
}): Promise<Deal> => {
  const supabase = getServiceSupabase();
  const payload = {
    id: randomUUID(),
    merchant: merchantAddress,
    title,
    description: description ?? null,
    discount,
    image_url: imageUrl ?? null,
    tags: tags ?? [],
    nft_mint: nftMint,
    total_supply: supply,
    expiry: expiresAt
  };

  const { data, error } = await supabase
    .from<DealRow>(DEALS_TABLE)
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapDealRow(data, 0);
};

export const findClaimByWallet = async (dealId: string, walletAddress: string) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from<Pick<MintRow, 'mint' | 'deal_id' | 'owner'>>(MINTS_TABLE)
    .select('mint, deal_id, owner')
    .eq('deal_id', dealId)
    .eq('owner', walletAddress)
    .maybeSingle();

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
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from<Pick<MintRow, 'deal_id' | 'mint' | 'owner'>>(MINTS_TABLE)
    .insert({
      deal_id: dealId,
      owner: walletAddress,
      mint: mintAddress
    })
    .select('mint, deal_id, owner')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const registerRedeemNonce = async ({
  mint,
  nonce,
  expiresAt
}: {
  mint: string;
  nonce: string;
  expiresAt: number;
}) => {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from<RedeemNonceRow>(REDEEM_NONCE_TABLE)
    .upsert(
      {
        mint,
        nonce,
        expires_at: new Date(expiresAt).toISOString(),
        used: false,
        used_at: null
      },
      { onConflict: 'mint,nonce' }
    );

  if (error) {
    throw error;
  }
};

export const fetchRedeemNonce = async ({
  mint,
  nonce
}: {
  mint: string;
  nonce: string;
}) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from<RedeemNonceRow>(REDEEM_NONCE_TABLE)
    .select('*')
    .eq('mint', mint)
    .eq('nonce', nonce)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const markNonceUsed = async ({ mint, nonce }: { mint: string; nonce: string }) => {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from<RedeemNonceRow>(REDEEM_NONCE_TABLE)
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('mint', mint)
    .eq('nonce', nonce);

  if (error) {
    throw error;
  }
};

export const markMintUsed = async (mint: string) => {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from<MintRow>(MINTS_TABLE)
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('mint', mint);

  if (error) {
    throw error;
  }
};
