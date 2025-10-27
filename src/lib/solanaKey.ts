import { Keypair } from '@solana/web3.js';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const decodeBase58 = (value: string): Uint8Array => {
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

export const parseSecretKey = (raw: string): Uint8Array => {
  const trimmed = raw.trim();

  try {
    const asArray = JSON.parse(trimmed);
    if (Array.isArray(asArray)) {
      return Uint8Array.from(asArray);
    }
  } catch (error) {
    // fall through to base58
  }

  const base64Like = /^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0;
  if (base64Like) {
    try {
      const decodedBase64 = Uint8Array.from(Buffer.from(trimmed, 'base64'));
      if (decodedBase64.length > 0) {
        return decodedBase64;
      }
    } catch (error) {
      // ignore and try base58
    }
  }

  const decoded = decodeBase58(trimmed);
  if (!decoded.length) {
    throw new Error('Unable to decode secret key');
  }
  return decoded;
};

export const keypairFromSecret = (raw: string): Keypair => {
  return Keypair.fromSecretKey(parseSecretKey(raw));
};

export const loadKeypairFromEnv = (envVar: string): Keypair => {
  const secret = process.env[envVar];
  if (!secret) {
    throw new Error(`Missing ${envVar}`);
  }
  return keypairFromSecret(secret);
};
