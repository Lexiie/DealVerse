import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletConnect } from './WalletConnect';

const navLinks = [
  { href: '/', label: 'Marketplace' },
  { href: '/merchant', label: 'Merchant' },
  { href: '/redeem', label: 'Redeem' }
];

const BottomNavigation = ({ hidden }: { hidden: boolean }) => {
  const router = useRouter();
  return (
    <nav
      className={`fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-40 w-[clamp(260px,92vw,420px)] -translate-x-1/2 rounded-2xl border border-slate-800/70 bg-slate-900/90 px-3 py-2 shadow-sm backdrop-blur transition-transform duration-150 ${
        hidden ? 'translate-y-24 opacity-0' : 'opacity-100'
      }`}
    >
      <div className="grid grid-cols-3 gap-2 text-[15px] font-medium">
        {navLinks.map(({ href, label }) => {
          const isActive = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-12 items-center justify-center rounded-xl text-center transition ${
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

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        return;
      }
      const isVisible = viewport.height < window.innerHeight - 120;
      setKeyboardVisible(isVisible);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pb-[calc(72px+env(safe-area-inset-bottom))] pt-14 text-foreground">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-11 w-full max-w-[640px] items-center justify-between px-4">
          <Link href="/" className="text-[21px] font-semibold tracking-tight text-primary">
            DealVerse
          </Link>
          <WalletConnect />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-20 text-[15px] leading-relaxed">
        {children}
      </main>
      <BottomNavigation hidden={isKeyboardVisible} />
    </div>
  );
};
