import dynamic from 'next/dynamic';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/format';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const WalletConnect = () => {
  const wallet = useWallet();

  const label = wallet.address ? `${truncateAddress(wallet.address)} ▾` : 'Connect Wallet';

  return (
    <WalletMultiButton
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
    >
      <span className="truncate text-center">{label}</span>
    </WalletMultiButton>
  );
};
