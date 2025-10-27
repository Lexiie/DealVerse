import type { NextApiRequest, NextApiResponse } from 'next';
import { parseSecretKey } from '@/lib/solanaKey';

export const config = { runtime: 'nodejs' };

type ResponseData = {
  ok: boolean;
  message?: string;
  length?: number;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const secret = process.env.SOLANA_SIGNER_SECRET_KEY;
    if (!secret) {
      return res.status(400).json({ ok: false, message: 'SOLANA_SIGNER_SECRET_KEY is missing' });
    }
    const decoded = parseSecretKey(secret);
    return res.status(200).json({ ok: true, length: decoded.length });
  } catch (error) {
    console.error('parseSecretKey failed', error);
    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    return res.status(500).json({ ok: false, message });
  }
}
