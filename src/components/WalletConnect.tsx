import dynamic from 'next/dynamic';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/format';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const WalletConnect = () => {
  const wallet = useWallet();

  return (
    <div className="flex items-center gap-3">
      <WalletMultiButton className="rounded-lg bg-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary" />
      {wallet.address ? (
        <span className="text-xs text-slate-400">{truncateAddress(wallet.address)}</span>
      ) : null}
    </div>
  );
};
