import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { randomUUID } from 'crypto';
import { getSolanaConnection } from './solana';
import { METAPLEX_COLLECTION_ADDRESS } from '@/utils/constants';
import { uploadMetadataAuto } from './storage';

let metaplex: Metaplex | null = null;

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const decodeBase58 = (value: string) => {
  let result = 0n;
  for (const char of value) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error('Invalid base58 character encountered');
    }
    result = result * 58n + BigInt(index);
  }

  const leadingZeros = value.match(/^1+/)?.[0].length ?? 0;
  const bytes: number[] = [];

  while (result > 0n) {
    bytes.push(Number(result & 0xffn));
    result >>= 8n;
  }

  for (let i = 0; i < leadingZeros; i += 1) {
    bytes.push(0);
  }

  return Uint8Array.from(bytes.reverse());
};

const parseSecretKey = (raw: string) => {
  try {
    const asArray = JSON.parse(raw);
    if (Array.isArray(asArray)) {
      return Uint8Array.from(asArray);
    }
  } catch (error) {
    // fall through to base58
  }

  const decoded = decodeBase58(raw.trim());
  if (!decoded.length) {
    throw new Error('Unable to decode signer secret key');
  }
  return decoded;
};

const getIdentityKeypair = () => {
  const secret = process.env.SOLANA_SIGNER_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing SOLANA_SIGNER_SECRET_KEY');
  }

  try {
    return Keypair.fromSecretKey(parseSecretKey(secret));
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
