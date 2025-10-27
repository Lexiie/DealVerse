export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? 'https://api.devnet.solana.com';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const DEALS_TABLE = 'deals';
export const CLAIMS_TABLE = 'claims';
export const REDEMPTIONS_TABLE = 'redemptions';
export const QR_NONCE_LENGTH = 16;

export const METAPLEX_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS ?? '';
export const REDEEM_PROGRAM_ID = process.env.NEXT_PUBLIC_REDEEM_PROGRAM_ID ?? '';
