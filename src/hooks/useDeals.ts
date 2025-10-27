import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Deal, ClaimRequestPayload, ClaimResponse, MintResponse, RedeemRequestPayload, RedeemResponse, MintDealRequestPayload } from '@/types';

const fetchDeals = async (): Promise<Deal[]> => {
  const response = await fetch('/api/deals');
  if (!response.ok) {
    throw new Error('Failed to fetch deals');
  }
  return response.json();
};

export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
    staleTime: 30_000
  });
};

const postJson = async <TResponse>(url: string, body: unknown): Promise<TResponse> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json();
};

export const useMintDeal = () => {
  return useMutation<MintResponse, Error, MintDealRequestPayload>({
    mutationFn: (payload) => postJson('/api/mint', payload)
  });
};

export const useClaimDeal = () => {
  const queryClient = useQueryClient();
  return useMutation<ClaimResponse, Error, ClaimRequestPayload>({
    mutationFn: (payload) => postJson('/api/claim', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    }
  });
};

export const useRedeemCoupon = () => {
  return useMutation<RedeemResponse, Error, RedeemRequestPayload>({
    mutationFn: (payload) => postJson('/api/redeem', payload)
  });
};
