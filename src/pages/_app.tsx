import '@/styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { AppLayout } from '@/components/Layout';
import { getWalletAdapters } from '@/lib/wallets';
import { resolveEndpoint } from '@/lib/solana';
import { Toaster } from 'sonner';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const endpoint = resolveEndpoint();
  const wallets = useMemo(() => getWalletAdapters(), []);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
            <Toaster richColors theme="dark" />
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default MyApp;
