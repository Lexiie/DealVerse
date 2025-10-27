import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { decodeQrPayload } from '@/lib/qr';
import { truncateAddress } from '@/utils/format';

export type QrCodeDisplayProps = {
  encodedPayload: string;
};

export const QrCodeDisplay = ({ encodedPayload }: QrCodeDisplayProps) => {
  const payload = decodeQrPayload(encodedPayload);

  return (
    <Card className="flex flex-col items-center text-center">
      <CardHeader title="Your Coupon QR" subtitle="Present this to the merchant to redeem" />
      <CardContent className="flex flex-col items-center gap-4">
        <QRCodeCanvas value={encodedPayload} size={220} bgColor="#0f172a" fgColor="#22d3ee" />
        {payload ? (
          <div className="text-xs text-slate-400">
            <p>Deal: {payload.dealId}</p>
            <p>Owner: {truncateAddress(payload.owner)}</p>
            <p>Mint: {truncateAddress(payload.couponMint)}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
