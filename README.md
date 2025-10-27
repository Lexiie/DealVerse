# DealVerse

DealVerse is a Web3-native deal discovery and loyalty platform where promotions are minted as NFT coupons on Solana. The project follows the [prd.md](./prd.md) specification and ships a Next.js (TypeScript) MVP with merchant minting, user discovery, and QR-based redemption flows.

## Tech Stack

- Next.js 14, React 18, TypeScript
- TailwindCSS + custom shadcn-inspired UI components
- Solana wallet adapter (`@solana/wallet-adapter-*`)
- Metaplex JS SDK for NFT minting
- Supabase (Postgres) for deal, claim, and redemption records
- Sonner (toasts), react-hook-form, react-query

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill in the values:
   - `NEXT_PUBLIC_SOLANA_CLUSTER` (Devnet RPC)
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SOLANA_SIGNER_SECRET_KEY` (JSON array for the merchant signer)
   - Optional: `NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS`, `NEXT_PUBLIC_REDEEM_PROGRAM_ID`
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` for the marketplace, `/merchant` for minting, and `/redeem` for QR verification.

## Testing

```bash
npm test
```

Tests currently cover QR helper utilities; extend with more unit and integration coverage as the API solidifies.

## Key Architecture Notes

- All blockchain access is centralized in `src/lib/solana.ts` and `src/lib/metaplex.ts` per guardrails.
- Supabase is the single off-chain source of truth via helpers in `src/lib/deals.ts`.
- Nonce-based QR payloads prevent replay and are validated in both UI and API layers.
- API routes live under `src/pages/api` and orchestrate minting, claiming, and redeeming flows.

## Roadmap

- Integrate on-chain redemption logging via the optional redeem program.
- Add social discovery (ratings/comments) layer backed by Supabase.
- Harden NFT distribution by delivering transactions directly from merchant to user wallets.

