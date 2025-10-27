import { BackpackWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter, SolletExtensionWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SOLANA_CLUSTER } from '@/utils/constants';

const mapClusterToWalletNetwork = (clusterUrl: string): WalletAdapterNetwork => {
  if (clusterUrl.includes('devnet')) {
    return WalletAdapterNetwork.Devnet;
  }
  if (clusterUrl.includes('testnet')) {
    return WalletAdapterNetwork.Testnet;
  }
  return WalletAdapterNetwork.Mainnet;
};

export const getWalletAdapters = () => {
  const network = mapClusterToWalletNetwork(SOLANA_CLUSTER);
  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
    new BackpackWalletAdapter(),
    new SolletExtensionWalletAdapter({ network })
  ];
};
