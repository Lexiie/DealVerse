import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solana';
import { METAPLEX_COLLECTION_ADDRESS } from '@/utils/constants';

let metaplex: Metaplex | null = null;

const getIdentityKeypair = () => {
  const secret = process.env.SOLANA_SIGNER_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing SOLANA_SIGNER_SECRET_KEY');
  }

  try {
    const secretKey = Uint8Array.from(JSON.parse(secret));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Failed to parse signer key', error);
    throw error;
  }
};

export const getMetaplex = () => {
  if (metaplex) {
    return metaplex;
  }

  const connection = getSolanaConnection();
  const identity = getIdentityKeypair();

  metaplex = Metaplex.make(connection)
    .use(keypairIdentity(identity))
    .use(
      bundlrStorage({
        address: 'https://node1.bundlr.network',
        providerUrl: connection.rpcEndpoint,
        timeout: 60000
      })
    );

  return metaplex;
};

export type MintCouponPayload = {
  name: string;
  description: string;
  imageUrl: string;
  discount: string;
  supply: number;
  expiresAt: string;
  tags?: string[];
};

export const mintCouponNft = async (payload: MintCouponPayload) => {
  const client = getMetaplex();

  try {
    const { nft } = await client.nfts().create({
      name: payload.name,
      symbol: 'DEAL',
      sellerFeeBasisPoints: 0,
      maxSupply: payload.supply,
      collection: METAPLEX_COLLECTION_ADDRESS
        ? new PublicKey(METAPLEX_COLLECTION_ADDRESS)
        : undefined,
      json: {
        name: payload.name,
        description: payload.description,
        image: payload.imageUrl,
        attributes: [
          { trait_type: 'discount', value: payload.discount },
          { trait_type: 'expires_at', value: payload.expiresAt },
          ...(payload.tags ?? []).map((tag) => ({ trait_type: 'tag', value: tag }))
        ]
      }
    });

    return nft;
  } catch (error) {
    console.error('Minting failed', error);
    throw error;
  }
};
