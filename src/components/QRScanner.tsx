import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { isQrPayloadValid, decodeQrPayload } from '@/lib/qr';

type QRData = string | null;
type ScannerResult = IDetectedBarcode[];

export type QRScannerProps = {
  onResult: (encodedPayload: string) => void;
  onError?: (message: string) => void;
};

const DynamicQrScanner = dynamic(async () => {
  const mod = await import('@yudiel/react-qr-scanner');
  return mod.Scanner ?? mod.default;
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
    <div className="relative mx-auto w-[90%] max-w-xl">
      <div className="relative aspect-square overflow-hidden rounded-[32px] border-2 border-primary/70 bg-slate-900/85 shadow-2xl">
        <DynamicQrScanner
          onScan={(results: ScannerResult) => {
            const value = results[0]?.rawValue ?? null;
            handleScan(value);
          }}
          onError={handleError}
          constraints={{ facingMode: 'environment' }}
          styles={{
            container: { width: '100%', height: '100%' },
            video: { width: '100%', height: '100%', objectFit: 'cover' }
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-primary/20 ring-1 ring-primary/20" />
        <div
          className="pointer-events-none absolute inset-0 bg-slate-950/70"
          style={{ WebkitMaskImage: 'radial-gradient(circle at center, transparent 55%, black 78%)', maskImage: 'radial-gradient(circle at center, transparent 55%, black 78%)' }}
        />
        <div className="pointer-events-none absolute inset-4 rounded-3xl border-2 border-primary/50" />
        <button
          type="button"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-lg text-slate-200 shadow"
          aria-label="Toggle flash"
        >
          ⚡
        </button>
        <button
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-lg text-slate-200 shadow"
          aria-label="Switch camera"
        >
          🔄
        </button>
        <div className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-base text-slate-950 shadow-lg">
          ▢
        </div>
      </div>
    </div>
  );
};
