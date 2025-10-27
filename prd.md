---

# 🪐 DealVerse — Web3 Deal Discovery & Loyalty Platform
**Mode:** Vercel-only CI/CD (tanpa instalasi lokal)  
**Track:** MonkeDAO × Superteam Earn — Cypherpunk

---

## 0) Prinsip Build & Deploy
- **Tidak ada** `npm install`, `npm run dev`, atau build lokal.
- Seluruh proses **scaffold → commit → deploy** berjalan via **Git push → Vercel**.
- Vercel akan mengerjakan install & build **otomatis** di cloud berdasarkan `package.json`.
- Dokumen ini memandu **Codex** untuk **menghasilkan kode & file** yang siap dipush ke GitHub, lalu **Vercel** yang mengeksekusi build.

---

## 1) Tujuan Produk (MVP)
- NFT Coupon marketplace di **Solana** (Devnet).
- **Merchant**: buat promo → mint NFT kupon.
- **User**: browse → claim NFT kupon.
- **Redeem**: verifikasi via **QR** (ownership + nonce + expiry).
- **Off-chain index**: Supabase (deals, mints, redeem).

---

## 2) Tech Stack (tanpa instruksi install)
- **Framework:** Next.js (TypeScript)
- **UI:** TailwindCSS, shadcn/ui, qrcode.react
- **Wallet/Web3:** `@solana/web3.js`, wallet-adapter (react/ui/wallets)
- **NFT Minting:** Metaplex SDK `@metaplex-foundation/js`
- **Storage:** Arweave/Pinata (metadata)
- **Database:** Supabase (Postgres)
- **Runtime API:** Node.js (bukan Edge)
- **Deploy:** Vercel (Production & Preview)

> Codex **hanya** membuat file & konfigurasi. **Tidak** membuat instruksi instalasi lokal.

---

## 3) Struktur Repo (yang HARUS dibuat Codex)

dealverse/ ├─ README.md ├─ package.json ├─ next.config.js ├─ tsconfig.json ├─ vercel.json                      # opsional: headers dasar ├─ .env.local.example               # contoh keys (tanpa nilai) │ ├─ src/ │  ├─ pages/ │  │  ├─ index.tsx                  # Marketplace (User) │  │  ├─ merchant.tsx               # Merchant Dashboard │  │  ├─ redeem.tsx                 # QR Verify │  │  └─ api/ │  │     ├─ mint.ts                 # POST mint NFT (runtime: nodejs) │  │     ├─ claim.ts                # POST claim kupon │  │     ├─ redeem.ts               # POST verifikasi QR → mark redeemed │  │     └─ deals.ts                # GET daftar deals │  │ │  ├─ components/ │  │  ├─ DealCard.tsx │  │  ├─ MerchantForm.tsx │  │  ├─ QRScanner.tsx │  │  └─ WalletConnect.tsx │  │ │  ├─ lib/ │  │  ├─ solana.ts                  # Connection & helpers │  │  ├─ metaplex.ts                # Mint helpers │  │  ├─ supabase.ts                # Supabase client (browser & server) │  │  └─ qr.ts                      # QR payload utils (nonce/TTL) │  │ │  ├─ hooks/ │  │  ├─ useWallet.ts │  │  └─ useDeals.ts │  │ │  ├─ utils/ │  │  └─ constants.ts               # config constants │  │ │  └─ styles/ │     └─ globals.css │ ├─ prisma/ │  └─ schema.prisma                 # jika pakai Prisma (opsional) │ └─ scripts/ ├─ seed.ts                       # seeding via Supabase service (optional) └─ verify-redeem.ts              # helper test (optional)

---

## 4) Environment Variables (Vercel Project Settings)
> **Ditetapkan di Vercel** (Production & Preview). Jangan pernah menaruh nilai asli di repo.

**Client-safe (NEXT_PUBLIC_)**

NEXT_PUBLIC_SOLANA_CLUSTER=devnet NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co NEXT_PUBLIC_SUPABASE_KEY=<anon_key>

**Server-only**

SOLANA_SIGNER_SECRET_KEY=<base58_private_key_merchant_signer> SUPABASE_SERVICE_ROLE=<service_role_key> ARWEAVE_KEY=<optional_if_used>

**Catatan untuk Codex:**
- Buat file `.env.local.example` **tanpa** values (placeholder saja), agar developer tahu nama variabelnya.
- Jangan menambahkan instruksi “jalankan X di lokal”.

---

## 5) Konfigurasi Build & Runtime (Vercel)
- **Node.js Version:** 20.x (Project → Settings → General).
- **Framework:** Next.js (autodetect).
- **Build Command:** `next build` (autodetect oleh Vercel).
- **API Runtime:** **Node.js (bukan Edge)**. Tambahkan di **setiap** file API:
  ```ts
  export const config = { runtime: "nodejs" };

vercel.json (opsional; headers keamanan ringan):

{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}



---

6) Skema Supabase (SQL dieksekusi di Supabase, bukan lokal)

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  merchant text not null,
  title text not null,
  discount int not null check (discount between 1 and 100),
  expiry timestamptz not null,
  total_supply int default 1,
  created_at timestamptz default now()
);

create table if not exists mints (
  mint text primary key,
  deal_id uuid references deals(id) on delete cascade,
  owner text,
  used boolean default false,
  used_at timestamptz
);

create table if not exists redeem_nonce (
  mint text references mints(mint) on delete cascade,
  nonce text,
  expires_at timestamptz,
  used boolean default false,
  used_at timestamptz,
  primary key (mint, nonce)
);

RLS (ringkas):

Aktifkan RLS untuk semua tabel.

SELECT publik untuk deals & mints jika diperlukan UI.

INSERT/UPDATE hanya via Service Role (API server Vercel).



---

7) Logika Inti (cuplikan — cukup untuk Vercel build)

> Catatan untuk Codex: cukup tulis file-file ini. Jangan sertakan perintah CLI.



src/lib/solana.ts

import { Connection, clusterApiUrl } from "@solana/web3.js";

export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("devnet"),
  "confirmed"
);

src/lib/qr.ts

export function generateQRPayload(mint: string, owner: string) {
  const nonce = Math.random().toString(36).slice(2, 10);
  const exp = Date.now() + 2 * 60 * 1000; // TTL 2 menit
  return { mint, owner, nonce, exp };
}

src/pages/api/redeem.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/solana";

export const config = { runtime: "nodejs" };

// TODO: tambahkan Supabase update (mark nonce used), rate limit, dan Zod validation.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { mint, owner } = req.body as { mint: string; owner: string };
    const largest = await connection.getTokenLargestAccounts(new PublicKey(mint));
    const holder = largest.value[0]?.address?.toBase58();
    if (!holder || holder !== owner) return res.status(403).json({ ok: false, error: "Invalid owner" });
    return res.status(200).json({ ok: true, redeemed: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Redeem failed" });
  }
}

> Endpoint API lain (mint.ts, claim.ts, deals.ts) ditulis serupa (server-only keys, runtime nodejs, error handling dasar). Tidak perlu dokumentasi perintah install.




---

8) UX Ringkas

Marketplace: grid deals, badge “Expiring Soon”, tag “Owned”.

Merchant: form promo → mint → tabel status.

Redeem: scanner dengan feedback ✅ / ❌, tampilkan short pubkey & countdown TTL.



---

9) Guardrails untuk Codex (WAJIB)

1. Jangan menulis instruksi instalasi lokal, perintah CLI, atau langkah Termux.


2. Semua konfigurasi diarahkan ke Vercel (env vars, build, runtime Node.js).


3. Simpan secret hanya sebagai server env (tanpa NEXT_PUBLIC_).


4. Set export const config = { runtime: "nodejs" } di setiap API.


5. Abstraksi Web3 di src/lib/*; komponen React functional + hooks.


6. QR payload harus memiliki nonce + exp (TTL).


7. Verifikasi ownership NFT via RPC sebelum menandai redeemed.


8. Update state redeem via Supabase (service role di server), bukan client.


9. Jangan menambahkan dependensi/alat di luar yang tersirat di package.json yang dihasilkan.


10. Pastikan seluruh repo siap deploy hanya dengan Git push → Vercel.




---

10) Deliverables

Repo berisi kode lengkap sesuai struktur di atas.

Vercel Project terhubung ke repo (deploy otomatis pada push).

Environment Variables terpasang di Vercel.

Aplikasi live (Production URL) dengan halaman /, /merchant, /redeem.




---


