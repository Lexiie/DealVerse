import { Metaplex, irysStorage, keypairIdentity } from '@metaplex-foundation/js';
import { connection } from './solana';
import { keypairFromSecret } from './solanaKey';

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

const uploadToIrys = async (metadata: Record<string, any>) => {
  const secret = process.env.IRYS_SECRET_KEY ?? process.env.SOLANA_SIGNER_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing IRYS_SECRET_KEY or SOLANA_SIGNER_SECRET_KEY for metadata uploads');
  }

  const identity = keypairFromSecret(secret);
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(identity))
    .use(
      irysStorage({
        address: process.env.IRYS_NODE_ADDRESS ?? 'https://node1.irys.xyz',
        providerUrl: connection.rpcEndpoint,
        timeout: 60000,
        identity
      })
    );

  const { uri } = await metaplex.storage().uploadJson(metadata);
  return uri;
};

export const uploadMetadataAuto = async ({ metadata, preprovidedUri }: UploadParams): Promise<string> => {
  const hasPinata = isSet(process.env.PINATA_JWT);
  const hasIrys = isSet(process.env.IRYS_SECRET_KEY ?? process.env.SOLANA_SIGNER_SECRET_KEY);

  if (hasPinata) {
    return uploadToPinata(metadata);
  }

  if (hasIrys) {
    return uploadToIrys(metadata);
  }

  if (isSet(preprovidedUri)) {
    return preprovidedUri!;
  }

  throw new Error('No storage configured. Provide PINATA_JWT or ARWEAVE_KEY_JSON, or pass a preprovidedUri.');
};

