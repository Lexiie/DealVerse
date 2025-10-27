import { QR_NONCE_LENGTH, QR_TTL_MS } from '@/utils/constants';

const getRandomBytes = (length: number) => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array;
  }

  const { randomBytes } = require('crypto');
  return randomBytes(length);
};

const encodeBase64 = (data: string) => {
  if (typeof window !== 'undefined' && window.btoa) {
    const bytes = new TextEncoder().encode(data);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  }
  return Buffer.from(data, 'utf8').toString('base64');
};

const decodeBase64 = (data: string) => {
  if (typeof window !== 'undefined' && window.atob) {
    const binary = window.atob(data);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(data, 'base64').toString('utf8');
};

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes)
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('');

export type QrPayload = {
  dealId: string;
  couponMint: string;
  owner: string;
  nonce: string;
  expiresAt: number;
};

export const createNonce = (length = QR_NONCE_LENGTH) => bytesToHex(getRandomBytes(length));

export const createQrPayload = ({
  dealId,
  couponMint,
  owner,
  ttlMs = QR_TTL_MS
}: {
  dealId: string;
  couponMint: string;
  owner: string;
  ttlMs?: number;
}): QrPayload => ({
  dealId,
  couponMint,
  owner,
  nonce: createNonce(),
  expiresAt: Date.now() + ttlMs
});

export const encodeQrPayload = (payload: QrPayload) => encodeBase64(JSON.stringify(payload));

export const decodeQrPayload = (encoded: string): QrPayload | null => {
  try {
    const json = decodeBase64(encoded);
    const parsed = JSON.parse(json);
    if (!parsed.nonce || !parsed.dealId || !parsed.couponMint || !parsed.owner) {
      return null;
    }
    return parsed as QrPayload;
  } catch (error) {
    console.error('Failed to decode QR payload', error);
    return null;
  }
};

export const isQrPayloadValid = (payload: QrPayload | null) => {
  if (!payload) {
    return false;
  }
  return payload.expiresAt > Date.now();
};
