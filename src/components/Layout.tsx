import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletConnect } from './WalletConnect';

const navLinks = [
  { href: '/', label: 'Marketplace' },
  { href: '/merchant', label: 'Merchant' },
  { href: '/redeem', label: 'Redeem' }
];

const BottomNavigation = () => {
  const router = useRouter();
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[clamp(260px,90vw,420px)] -translate-x-1/2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-2 shadow-xl backdrop-blur">
      <div className="grid grid-cols-3 gap-2 text-sm font-medium">
        {navLinks.map(({ href, label }) => {
          const isActive = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-xl px-3 py-2 text-center transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-950/98 pb-24 pt-14">
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
          DealVerse
        </Link>
        <WalletConnect />
      </div>
    </header>
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 text-[15px] leading-relaxed text-foreground md:px-6">
      {children}
    </main>
    <BottomNavigation />
  </div>
);
