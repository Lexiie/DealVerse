import { Metaplex, keypairIdentity, irysStorage } from '@metaplex-foundation/js';
import { PublicKey } from '@solana/web3.js';
import { randomUUID } from 'crypto';
import { getSolanaConnection } from './solana';
import { METAPLEX_COLLECTION_ADDRESS } from '@/utils/constants';
import { uploadMetadataAuto } from './storage';
import { loadKeypairFromEnv } from './solanaKey';

let metaplex: Metaplex | null = null;

const getIdentityKeypair = () => {
  try {
    return loadKeypairFromEnv('SOLANA_SIGNER_SECRET_KEY');
  } catch (error) {
    console.error('Failed to load signer key', error);
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
      irysStorage({
        address: 'https://node1.bundlr.network',
        providerUrl: connection.rpcEndpoint,
        timeout: 60000
      })
    );

  return metaplex;
};

export type MintCouponPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  discount: number;
  supply: number;
  expiresAt: string;
  tags?: string[];
  preprovidedUri?: string;
};

export const mintCouponNft = async (payload: MintCouponPayload) => {
  const client = getMetaplex();

  try {
    const metadata = {
      name: payload.name,
      symbol: 'DEAL',
      description: payload.description ?? '',
      image: payload.imageUrl ?? '',
      attributes: [
        { trait_type: 'discount', value: `${payload.discount}%` },
        { trait_type: 'expires_at', value: payload.expiresAt },
        ...(payload.tags ?? []).map((tag) => ({ trait_type: 'tag', value: tag })),
        { trait_type: 'uuid', value: randomUUID() }
      ],
      properties: {
        category: 'deal',
        redemption: 'qr+nonce'
      }
    };

    const metadataUri = await uploadMetadataAuto({
      metadata,
      preprovidedUri: payload.preprovidedUri
    });

    const { nft } = await client.nfts().create({
      name: payload.name,
      symbol: 'DEAL',
      sellerFeeBasisPoints: 0,
      maxSupply: payload.supply,
      collection: METAPLEX_COLLECTION_ADDRESS
        ? new PublicKey(METAPLEX_COLLECTION_ADDRESS)
        : undefined,
      uri: metadataUri,
      isMutable: true
    });

    return { nft, uri: metadataUri };
  } catch (error) {
    console.error('Minting failed', error);
    throw error;
  }
};
