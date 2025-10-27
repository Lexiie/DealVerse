import Link from 'next/link';
import { ReactNode } from 'react';
import { WalletConnect } from './WalletConnect';

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_60%)] py-12">
    <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-10 text-foreground md:flex-row md:items-center md:justify-between">
      <Link href="/" className="text-2xl font-semibold text-primary">
        DealVerse
      </Link>
      <nav className="flex items-center gap-6 text-sm text-slate-300">
        <Link href="/merchant" className="hover:text-primary">
          Merchant Dashboard
        </Link>
        <Link href="/redeem" className="hover:text-primary">
          Redeem Coupon
        </Link>
        <WalletConnect />
      </nav>
    </header>
    <main className="mx-auto w-full max-w-6xl px-6">{children}</main>
  </div>
);
