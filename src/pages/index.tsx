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
      <section className="mt-4 mb-8 space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-5 shadow-lg">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Web3 Coupons</p>
          <h1
            className="max-w-prose text-[22px] font-semibold leading-tight text-foreground sm:text-[26px]"
            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
          >
            Discover, claim, and trade NFT-powered deals on Solana.
          </h1>
          <p className="max-w-prose text-[18px] leading-relaxed text-slate-300 sm:text-[20px]">
            DealVerse transforms traditional promotions into dynamic, tradable assets. Own your rewards, share them with friends, or redeem in-store with on-chain verification.
          </p>
        </div>
        <div className="space-y-3 rounded-2xl bg-slate-900/80 px-4 py-4">
          {[
            'Minted directly on Solana Devnet',
            'QR redemption with nonce protection',
            'Transfers stay verifiable on-chain',
            'Supabase keeps redemptions honest'
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[14px] text-slate-200">
              <span className="text-emerald-400">✔</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? (
        <p className="text-slate-400">Loading deals…</p>
      ) : null}
      {isError ? <p className="text-red-400">Failed to load deals. Check Supabase configuration.</p> : null}

      <section className="space-y-4 pb-24">
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
        <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
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
