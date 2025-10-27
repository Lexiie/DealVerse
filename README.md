# DealVerse

DealVerse is a Web3-native deal discovery and loyalty platform where Solana NFT coupons unlock IRL promotions. Specification and ships a Next.js (TypeScript) MVP featuring merchant minting, user discovery, and QR-based redemption with Supabase-backed auditability.

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

## Local Development

Although DealVerse is optimised for Vercel-first deployments, you can still run it locally when you need deeper debugging or iterative UI work.

### Prerequisites

- Node.js 20.x and npm 10+
- Supabase project (or equivalent Postgres instance reachable via Supabase client)
- (Optional) Solana CLI for generating local keypairs

### 1. Install dependencies

```bash
git clone https://github.com/your-org/DealVerse.git
cd DealVerse
npm install
```

### 2. Configure environment variables

Duplicate the template and populate it with your local credentials:

```bash
cp .env.local.example .env.local
```

Fill in at least:

- `NEXT_PUBLIC_SOLANA_CLUSTER` – e.g. `devnet`
- `NEXT_PUBLIC_SOLANA_RPC` – Devnet RPC (default `https://api.devnet.solana.com` or your Helius endpoint)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE`
- `SOLANA_SIGNER_SECRET_KEY` – secret key in JSON array, base58/base64/base64url, or hex (32/64 bytes)
- Optional storage keys such as `ARWEAVE_KEY`

### 3. Provision database tables

Ensure the required tables exist in Supabase by running:

```sql
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  merchant text not null,
  title text not null,
  description text,
  discount int not null,
  image_url text,
  tags text[],
  nft_mint text,
  total_supply int not null,
  expiry timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists mints (
  deal_id text not null,
  mint text not null,
  owner text not null,
  used boolean default false,
  used_at timestamptz,
  created_at timestamptz default now(),
  primary key (deal_id, owner)
);

create table if not exists redeem_nonce (
  mint text not null,
  nonce text not null,
  expires_at timestamptz not null,
  used boolean default false,
  used_at timestamptz,
  primary key (mint, nonce)
);
```

### 4. Run the app locally

```bash
npm run dev
```

The app will be available on http://localhost:3000. Linting and type checks can be run with:

```bash
npm run lint
npm run typecheck
```

When you are done with local edits, push commits to trigger the usual Vercel deployment flow.
