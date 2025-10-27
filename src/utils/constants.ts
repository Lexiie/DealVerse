export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? 'devnet';
export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? '';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? '';
export const DEALS_TABLE = 'deals';
export const MINTS_TABLE = 'mints';
export const REDEEM_NONCE_TABLE = 'redeem_nonce';
export const QR_NONCE_LENGTH = 16;
export const QR_TTL_MS = 2 * 60 * 1000; // 2 minutes TTL per guardrail

export const METAPLEX_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS ?? '';
