import Head from 'next/head';
import { useState } from 'react';
import { MerchantForm } from '@/components/MerchantForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMintDeal } from '@/hooks/useDeals';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { CreateDealPayload } from '@/types';

const MerchantPage = () => {
  const wallet = useWallet();
  const mintMutation = useMintDeal();
  const [mintAddress, setMintAddress] = useState<string | null>(null);

  const handleSubmit = async (values: CreateDealPayload) => {
    if (!wallet.connected || !wallet.address) {
      toast.error('Connect your merchant wallet before minting');
      return;
    }

    try {
      const response = await mintMutation.mutateAsync({
        ...values,
        merchantAddress: wallet.address
      });
      if (response.success && response.mintAddress) {
        setMintAddress(response.mintAddress);
        toast.success('Deal minted and indexed successfully!');
      } else {
        toast.error(response.error ?? 'Failed to mint deal');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mint deal';
      toast.error(message);
    }
  };

  const handleCopyMint = async () => {
    if (!mintAddress) {
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error('Clipboard is not available in this environment');
      return;
    }
    await navigator.clipboard.writeText(mintAddress);
    toast.success('Mint address copied to clipboard');
  };

  return (
    <>
      <Head>
        <title>DealVerse Merchant Dashboard</title>
      </Head>
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <MerchantForm onSubmit={handleSubmit} isSubmitting={mintMutation.isPending} />
        <aside className="space-y-4">
          <Card>
            <CardHeader title="Minting Checklist" subtitle="Ensure your deal is ready for the chain" />
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>1. Connect Phantom or Solflare wallet.</p>
              <p>2. Upload artwork to Arweave/Pinata and paste the URL.</p>
              <p>3. Set an expiry time that matches in-store availability.</p>
              <p>4. Mint — metadata and Supabase records update automatically.</p>
            </CardContent>
          </Card>
          {mintAddress ? (
            <Card>
              <CardHeader title="Mint Details" />
              <CardContent className="space-y-3 text-sm text-slate-200">
                <p className="break-all text-xs text-slate-400">{mintAddress}</p>
                <Button
                  variant="secondary"
                  onClick={handleCopyMint}
                >
                  Copy Mint Address
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
};

export default MerchantPage;
