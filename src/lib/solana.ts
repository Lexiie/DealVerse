import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_CLUSTER } from '@/utils/constants';

let connection: Connection | null = null;

export const getSolanaConnection = () => {
  if (!connection) {
    connection = new Connection(SOLANA_CLUSTER, {
      commitment: 'confirmed'
    });
  }
  return connection;
};

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
