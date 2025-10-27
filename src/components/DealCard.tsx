import Image from 'next/image';
import { Deal } from '@/types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatDate } from '@/utils/format';

export type DealCardProps = {
  deal: Deal;
  onClaim?: (deal: Deal) => void;
  isClaiming?: boolean;
};

export const DealCard = ({ deal, onClaim, isClaiming }: DealCardProps) => {
  const expiresLabel = `Expires ${formatDate(deal.expiresAt)}`;
  const canClaim = deal.status === 'active' && deal.remaining > 0;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-800">
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black text-4xl font-bold text-primary">
            {deal.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-foreground">{deal.title}</h3>
          <Badge>{deal.discount}</Badge>
        </div>
        <p className="text-sm text-slate-300">{deal.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>{expiresLabel}</span>
          <span>Remaining: {deal.remaining}/{deal.supply}</span>
          <span>Status: {deal.status}</span>
        </div>
      </div>
      <Button
        onClick={() => (onClaim ? onClaim(deal) : undefined)}
        disabled={!canClaim}
        isLoading={isClaiming}
        className="mt-auto"
      >
        {canClaim ? 'Claim NFT Coupon' : 'Not Available'}
      </Button>
    </article>
  );
};
