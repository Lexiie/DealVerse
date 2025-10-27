import { Metaplex, arweaveStorage, keypairIdentity } from '@metaplex-foundation/js';
import { Keypair } from '@solana/web3.js';
import { connection } from './solana';

type UploadParams = {
  metadata: Record<string, any>;
  preprovidedUri?: string;
};

const isSet = (value?: string) => typeof value === 'string' && value.trim().length > 0;

const getFetch = () => {
  const fetchImpl = globalThis.fetch;
  if (!fetchImpl) {
    throw new Error('Fetch API is not available in this environment');
  }
  return fetchImpl;
};

const uploadToPinata = async (metadata: Record<string, any>) => {
  const jwt = process.env.PINATA_JWT!;
  const fetchImpl = getFetch();
  const response = await fetchImpl('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${text}`);
  }

  const json = (await response.json()) as { IpfsHash: string };
  return `https://gateway.pinata.cloud/ipfs/${json.IpfsHash}`;
};

const uploadToArweave = async (metadata: Record<string, any>) => {
  const keyJson = process.env.ARWEAVE_KEY_JSON!;
  let key: unknown;

  try {
    key = JSON.parse(keyJson);
  } catch (error) {
    throw new Error('Invalid ARWEAVE_KEY_JSON: must be a valid JSON string');
  }

  const wallet = Keypair.generate();
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(
      arweaveStorage({
        key,
        host: 'https://arweave.net'
      })
    );

  const { uri } = await metaplex.storage().uploadJson(metadata);
  return uri;
};

export const uploadMetadataAuto = async ({ metadata, preprovidedUri }: UploadParams): Promise<string> => {
  const hasPinata = isSet(process.env.PINATA_JWT);
  const hasArweave = isSet(process.env.ARWEAVE_KEY_JSON);

  if (hasPinata) {
    return uploadToPinata(metadata);
  }

  if (hasArweave) {
    return uploadToArweave(metadata);
  }

  if (isSet(preprovidedUri)) {
    return preprovidedUri!;
  }

  throw new Error('No storage configured. Provide PINATA_JWT or ARWEAVE_KEY_JSON, or pass a preprovidedUri.');
};

