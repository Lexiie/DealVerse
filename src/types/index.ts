export type DealStatus = 'active' | 'expired' | 'sold_out';

export type Deal = {
  id: string;
  title: string;
  merchant: string;
  description?: string;
  discount: number;
  imageUrl?: string;
  nftMint?: string;
  tags?: string[];
  totalSupply: number;
  claimed: number;
  remaining: number;
  expiresAt: string;
  status: DealStatus;
};

export type ClaimResponse = {
  success: boolean;
  message: string;
  encodedPayload?: string;
};

export type MintResponse = {
  success: boolean;
  mintAddress?: string;
  dealId?: string;
  error?: string;
};

export type RedeemResponse = {
  success: boolean;
  error?: string;
};

export type CreateDealPayload = {
  title: string;
  description?: string;
  discount: number;
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
