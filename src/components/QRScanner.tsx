import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { isQrPayloadValid, decodeQrPayload } from '@/lib/qr';

type QRData = string | null;

export type QRScannerProps = {
  onResult: (encodedPayload: string) => void;
  onError?: (message: string) => void;
};

const QrReader = dynamic(async () => {
  const mod = await import('react-qr-reader');
  return mod.QrReader ?? mod.default;
}, {
  ssr: false
});

export const QRScanner = ({ onResult, onError }: QRScannerProps) => {
  const handleScan = useCallback(
    (data: QRData) => {
      if (!data) {
        return;
      }

      const payload = decodeQrPayload(data);
      if (!isQrPayloadValid(payload)) {
        onError?.('QR code is invalid or expired');
        return;
      }

      onResult(data);
    },
    [onResult, onError]
  );

  const handleError = useCallback(
    (error: unknown) => {
      console.error('QR scan error', error);
      onError?.('Failed to access camera');
    },
    [onError]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
    </div>
  );
};
