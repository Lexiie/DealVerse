import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [stepStates, setStepStates] = useState<Array<'pending' | 'done' | 'error'>>(['pending', 'pending', 'pending', 'pending']);

  const stepItems = useMemo(
    () => [
      { label: "Scan customer's QR" },
      { label: 'Verify NFT ownership' },
      { label: 'Log redemption' },
      { label: 'Done' }
    ],
    []
  );

  const handleRedeem = async (payload: string) => {
    if (!payload) {
      toast.error('QR payload is empty');
      return;
    }

    try {
      setStepStates(['done', 'pending', 'pending', 'pending']);
      const response = await redeemMutation.mutateAsync({ encodedPayload: payload });
      if (response.success) {
        setLastStatus('success');
        toast.success('Coupon redeemed!');
        setStepStates(['done', 'done', 'done', 'done']);
        setIsSheetOpen(true);
      } else {
        setLastStatus('error');
        toast.error(response.error ?? 'Unable to redeem coupon');
        setStepStates(['done', 'error', 'pending', 'pending']);
        setIsSheetOpen(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to redeem coupon';
      setLastStatus('error');
      toast.error(message);
      setStepStates(['done', 'error', 'pending', 'pending']);
      setIsSheetOpen(false);
    }
  };

  useEffect(() => {
    if (!isSheetOpen || redeemMutation.isPending) {
      return;
    }
    const timeout = window.setTimeout(() => setIsSheetOpen(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [isSheetOpen, redeemMutation.isPending]);

  return (
    <>
      <Head>
        <title>Redeem NFT Coupon</title>
      </Head>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-slate-900/75">
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Or paste coupon code</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={encodedPayload}
                  placeholder="Paste coupon code"
                  onChange={(event) => setEncodedPayload(event.target.value)}
                />
                <Button
                  className="h-12 w-full rounded-2xl sm:w-auto sm:px-8"
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
        <Card className="bg-slate-900/75">
          <CardHeader title="Tips" subtitle="Keep redemptions speedy and secure" />
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>• Ensure ambient lighting so the QR stays crisp.</p>
            <p>• Ask the customer to brighten their screen if scan fails.</p>
            <p>• If offline, use the manual code and sync later.</p>
          </CardContent>
        </Card>
      </div>

      {isSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-4 pb-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Verification Steps</h3>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="text-xs uppercase tracking-wide text-slate-400 hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {stepItems.map((item, index) => {
                const state = stepStates[index] ?? 'pending';
                const icon = state === 'done' ? '✅' : state === 'error' ? '❌' : '⚪';
                const borderTone = state === 'done' ? 'border-emerald-500/40' : state === 'error' ? 'border-rose-500/40' : 'border-slate-800/60';
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 rounded-2xl border ${borderTone} bg-slate-900/60 px-3 py-2`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium text-slate-200">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default RedeemPage;
