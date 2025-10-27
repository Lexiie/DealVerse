import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_CLUSTER, SOLANA_RPC } from '@/utils/constants';

export const resolveEndpoint = () => {
  if (SOLANA_RPC) {
    return SOLANA_RPC;
  }

  const supportedClusters = ['devnet', 'testnet', 'mainnet-beta'] as const;
  const cluster = supportedClusters.includes(SOLANA_CLUSTER as (typeof supportedClusters)[number])
    ? (SOLANA_CLUSTER as (typeof supportedClusters)[number])
    : 'devnet';

  return clusterApiUrl(cluster);
};

export const connection = new Connection(resolveEndpoint(), {
  commitment: 'confirmed'
});

export const getSolanaConnection = () => connection;

export const getPublicKey = (value: string | PublicKey | null | undefined): PublicKey | null => {
  if (!value) {
    return null;
  }
  try {
    return typeof value === 'string' ? new PublicKey(value) : value;
  } catch (error) {
    console.error('Invalid public key', error);
    return null;
  }
};

export const verifyCouponOwnership = async ({
  owner,
  mint
}: {
  owner: string;
  mint: string;
}) => {
  const connectionInstance = getSolanaConnection();
  const ownerKey = getPublicKey(owner);
  const mintKey = getPublicKey(mint);

  if (!ownerKey || !mintKey) {
    return false;
  }

  try {
    const tokenAccounts = await connectionInstance.getParsedTokenAccountsByOwner(ownerKey, {
      mint: mintKey
    });

    return tokenAccounts.value.some((account) => {
      const amount = account.account.data.parsed.info.tokenAmount.uiAmount ?? 0;
      return amount > 0;
    });
  } catch (error) {
    console.error('Failed to verify ownership', error);
    return false;
  }
};
