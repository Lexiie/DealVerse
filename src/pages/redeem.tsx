import Head from 'next/head';
import { useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRedeemCoupon } from '@/hooks/useDeals';
import { toast } from 'sonner';

const RedeemPage = () => {
  const redeemMutation = useRedeemCoupon();
  const [encodedPayload, setEncodedPayload] = useState('');
  const [lastStatus, setLastStatus] = useState<'success' | 'error' | null>(null);

  const handleRedeem = async (payload: string) => {
    if (!payload) {
      toast.error('QR payload is empty');
      return;
    }

    try {
      const response = await redeemMutation.mutateAsync({ encodedPayload: payload });
      if (response.success) {
        setLastStatus('success');
        toast.success('Coupon redeemed!');
      } else {
        setLastStatus('error');
        toast.error(response.error ?? 'Unable to redeem coupon');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to redeem coupon';
      setLastStatus('error');
      toast.error(message);
    }
  };

  return (
    <>
      <Head>
        <title>Redeem NFT Coupon</title>
      </Head>
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader title="Scan Coupon" subtitle="Verify coupon ownership in real time" />
          <CardContent className="space-y-6">
            <QRScanner
              onResult={(payload) => {
                setEncodedPayload(payload);
                handleRedeem(payload);
              }}
              onError={(message) => toast.error(message)}
            />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Manual Entry</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  value={encodedPayload}
                  placeholder="Paste encoded payload"
                  onChange={(event) => setEncodedPayload(event.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={() => handleRedeem(encodedPayload)}
                  disabled={!encodedPayload}
                  isLoading={redeemMutation.isPending}
                >
                  Redeem
                </Button>
              </div>
            </div>
            {lastStatus === 'success' ? (
              <p className="text-sm text-emerald-400">✅ Redemption recorded on Supabase & Solana.</p>
            ) : null}
            {lastStatus === 'error' ? (
              <p className="text-sm text-red-400">❌ Redemption failed. Check ownership or expiry.</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Verification Steps" />
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>1. Scan the customer's QR code.</p>
            <p>2. We verify the NFT owner via Solana RPC.</p>
            <p>3. Supabase logs the redemption with nonce to prevent replay.</p>
            <p>4. Optional: push redemption on-chain using the redeem program.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RedeemPage;
