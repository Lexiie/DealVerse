export type DealStatus = 'active' | 'expired' | 'draft';

export type Deal = {
  id: string;
  title: string;
  description: string;
  discount: string;
  merchantAddress: string;
  imageUrl?: string;
  nftMint?: string;
  supply: number;
  remaining: number;
  expiresAt: string;
  status: DealStatus;
  tags?: string[];
};

export type ClaimResponse = {
  success: boolean;
  message: string;
  claimId?: string;
  encodedPayload?: string;
};

export type MintResponse = {
  success: boolean;
  mintAddress?: string;
  error?: string;
};

export type RedeemResponse = {
  success: boolean;
  error?: string;
};

export type CreateDealPayload = {
  title: string;
  description: string;
  discount: string;
  supply: number;
  expiresAt: string;
  imageUrl?: string;
  tags?: string[];
};

export type MintDealRequestPayload = CreateDealPayload & {
  merchantAddress: string;
};

export type ClaimRequestPayload = {
  dealId: string;
  walletAddress: string;
};

export type RedeemRequestPayload = {
  encodedPayload: string;
};
