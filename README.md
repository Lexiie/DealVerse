# DealVerse

DealVerse is a Web3-native deal discovery and loyalty platform where Solana NFT coupons unlock IRL promotions. It follows the [prd.md](./prd.md) specification and ships a Next.js (TypeScript) MVP featuring merchant minting, user discovery, and QR-based redemption with Supabase-backed auditability.

## Tech Stack

- Next.js 14, React 18, TypeScript
- TailwindCSS + lightweight shadcn-inspired UI primitives
- Solana wallet adapter suite (`@solana/wallet-adapter-*`) and Metaplex JS SDK
- Supabase Postgres (deals, mints, redeem_nonce) with service-role API access
- qrcode.react + react-qr-reader for claim/redeem flows

## Deployment Flow

- Connect the repository to Vercel and rely on the managed CI/CD pipeline (`git push → Vercel build`).
- Set the project runtime to Node.js 20 and enable the default Next.js build (`next build`).
- Provision environment variables on Vercel (Production & Preview):
  - `NEXT_PUBLIC_SOLANA_CLUSTER`
  - `NEXT_PUBLIC_SOLANA_RPC`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_KEY`
  - `NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS`
  - `SOLANA_SIGNER_SECRET_KEY` (base58 or JSON array)
  - `SUPABASE_SERVICE_ROLE`
  - `ARWEAVE_KEY` (optional storage signer)
- Ensure Supabase hosts the schema defined in `prd.md` (tables: `deals`, `mints`, `redeem_nonce`, with RLS enabled and service-role writes).

## Architecture Notes

- `src/lib/solana.ts` centralises RPC configuration and token ownership verification.
- `src/lib/metaplex.ts` mints NFTs through Metaplex with Bundlr storage helpers.
- `src/lib/deals.ts` encapsulates Supabase reads/writes for deals, claims, and nonce lifecycle.
- API routes (`src/pages/api/*`) are pinned to the Node runtime and use service-role Supabase interactions exclusively server-side.
- QR payload helpers (`src/lib/qr.ts`) enforce per-claim nonces with a 2 minute TTL to satisfy replay guardrails.

## Operational Checklist

- Merchants mint via `/merchant`; users browse and claim on `/`; redemption happens on `/redeem` with on-chain ownership checks.
- Supabase tracks supply and redemptions (mints + nonce usage) so Vercel functions act as the trusted server component.
- Future enhancements can plug in on-chain redemption programs or richer analytics without changing the deployment flow.
