import Head from 'next/head';
import { useState } from 'react';
import { DealCard } from '@/components/DealCard';
import { QrCodeDisplay } from '@/components/QrCodeDisplay';
import { useDeals, useClaimDeal } from '@/hooks/useDeals';
import { useWallet } from '@/hooks/useWallet';
import { Deal } from '@/types';
import { toast } from 'sonner';

const MarketplacePage = () => {
  const { data: deals, isLoading, isError } = useDeals();
  const claimMutation = useClaimDeal();
  const wallet = useWallet();
  const [claimedPayload, setClaimedPayload] = useState<string | null>(null);

  const handleClaim = async (deal: Deal) => {
    if (!wallet.connected || !wallet.address) {
      toast.error('Connect your wallet to claim this coupon');
      return;
    }

    try {
      const response = await claimMutation.mutateAsync({
        dealId: deal.id,
        walletAddress: wallet.address
      });

      if (response.success && response.encodedPayload) {
        setClaimedPayload(response.encodedPayload);
        toast.success('Coupon claimed! Find it in your wallet and QR below.');
      } else {
        toast.error(response.message ?? 'Failed to claim coupon');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to claim coupon';
      toast.error(message);
    }
  };

  return (
    <>
      <Head>
        <title>DealVerse Marketplace</title>
      </Head>
      <section className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Web3 Coupons</p>
            <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
              Discover, claim, and trade NFT-powered deals on Solana.
            </h1>
            <p className="text-slate-300">
              DealVerse transforms traditional promotions into dynamic, tradable assets. Own your rewards, share them with friends, or redeem in-store with on-chain verification.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent p-6 text-sm text-slate-200">
            <ul className="space-y-3">
              <li>✅ Minted directly on Solana Devnet</li>
              <li>✅ QR redemption with nonce protection</li>
              <li>✅ Transfers stay verifiable on-chain</li>
              <li>✅ Supabase keeps real-world redemptions honest</li>
            </ul>
          </div>
        </div>
      </section>

      {isLoading ? (
        <p className="text-slate-400">Loading deals…</p>
      ) : null}
      {isError ? <p className="text-red-400">Failed to load deals. Check Supabase configuration.</p> : null}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {deals?.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onClaim={handleClaim}
            isClaiming={claimMutation.isPending && claimMutation.variables?.dealId === deal.id}
          />
        ))}
      </section>

      {deals && deals.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
          No deals yet. Merchants can mint the first promotion!
        </div>
      ) : null}

      {claimedPayload ? (
        <div className="mt-12 max-w-md">
          <QrCodeDisplay encodedPayload={claimedPayload} />
        </div>
      ) : null}
    </>
  );
};

export default MarketplacePage;
