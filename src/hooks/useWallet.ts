import { useWallet as useAdapterWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

export type WalletInfo = {
  connected: boolean;
  publicKey: PublicKey | null;
  address: string | null;
  connecting: boolean;
  disconnecting: boolean;
  connect: WalletContextState['connect'];
  disconnect: WalletContextState['disconnect'];
  signTransaction: WalletContextState['signTransaction'];
  signAllTransactions: WalletContextState['signAllTransactions'];
  sendTransaction: WalletContextState['sendTransaction'];
};

export const useWallet = (): WalletInfo => {
  const wallet = useAdapterWallet();

  return useMemo(
    () => ({
      connected: wallet.connected,
      publicKey: wallet.publicKey ?? null,
      address: wallet.publicKey?.toBase58() ?? null,
      connecting: wallet.connecting,
      disconnecting: wallet.disconnecting,
      connect: wallet.connect,
      disconnect: wallet.disconnect,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
      sendTransaction: wallet.sendTransaction
    }),
    [wallet.connected, wallet.publicKey, wallet.connecting, wallet.disconnecting, wallet.connect, wallet.disconnect, wallet.signTransaction, wallet.signAllTransactions, wallet.sendTransaction]
  );
};
