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
  const discountLabel = `${deal.discount}% OFF`;
  const canClaim = deal.status === 'active' && deal.remaining > 0;
  const statusLabel = deal.status.replace('_', ' ');

  return (
    <article className="mb-3 flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/75 p-4 shadow-lg backdrop-blur-lg last:mb-24">
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-slate-800">
        {deal.imageUrl ? (
          <Image src={deal.imageUrl} alt={deal.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black text-xl font-bold text-primary">
            {deal.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="space-y-1">
          <p className="max-w-[70%] truncate text-[11px] uppercase tracking-[0.28em] text-slate-400">{deal.merchant}</p>
          <h3
            className="text-[15px] font-semibold leading-tight text-foreground"
            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
          >
            {deal.title}
          </h3>
          {deal.description ? (
            <p className="max-h-[88px] overflow-auto whitespace-normal break-words pr-1 text-[14px] leading-relaxed text-slate-300">
              {deal.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-400">
          <Badge className="rounded-lg bg-slate-800/90 px-2 py-0.5 text-[12px] font-medium text-slate-200">{discountLabel}</Badge>
          <Badge className="rounded-lg bg-slate-800/90 px-2 py-0.5 text-[12px] font-medium text-slate-200">{statusLabel}</Badge>
          <span>{expiresLabel}</span>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => (onClaim ? onClaim(deal) : undefined)}
            disabled={!canClaim}
            isLoading={isClaiming}
            className="h-11 min-w-[96px] rounded-xl px-4 text-sm"
          >
            {canClaim ? 'Claim' : 'Hold'}
          </Button>
        </div>
      </div>
    </article>
  );
};
