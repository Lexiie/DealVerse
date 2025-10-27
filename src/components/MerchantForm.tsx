import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { CreateDealPayload } from '@/types';

export type MerchantFormProps = {
  defaultValues?: Partial<CreateDealPayload>;
  onSubmit: (values: CreateDealPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

type FormValues = Omit<CreateDealPayload, 'tags'> & {
  tagsText: string;
};

export const MerchantForm = ({ defaultValues, onSubmit, isSubmitting }: MerchantFormProps) => {
  const [openSection, setOpenSection] = useState<'info' | 'media' | 'review'>('info');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    shouldFocusError: true,
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      discount: defaultValues?.discount ?? 25,
      supply: defaultValues?.supply ?? 100,
      expiresAt: (defaultValues?.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()).slice(0, 16),
      imageUrl: defaultValues?.imageUrl ?? '',
      tagsText: defaultValues?.tags?.join(', ') ?? ''
    }
  });

  const submitHandler = handleSubmit(async (values) => {
    const tags = values.tagsText
      ? values.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean)
      : undefined;

    await onSubmit({
      title: values.title,
      description: values.description,
      discount: Number(values.discount),
      supply: Number(values.supply),
      expiresAt: values.expiresAt,
      imageUrl: values.imageUrl,
      tags
    });
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="sticky top-16 z-10 border-b border-slate-800/60 bg-slate-900/75 backdrop-blur"
        title="Create Deal"
        subtitle="Launch a promotion as an NFT coupon"
      />
      <CardContent className="px-1 py-6">
        <form className="space-y-6" onSubmit={submitHandler}>
          {[{
            id: 'info',
            title: 'Deal Info',
            description: 'Summarise the offer and supply details.'
          }, {
            id: 'media',
            title: 'Media & Tags',
            description: 'Add imagery and searchable tags.'
          }, {
            id: 'review',
            title: 'Review & Mint',
            description: 'Confirm everything looks right before minting.'
          }].map((section) => {
            const isOpen = openSection === section.id;
            return (
              <section key={section.id} className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4">
                <button
                  type="button"
                  onClick={() => setOpenSection(section.id as 'info' | 'media' | 'review')}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    <p className="text-xs text-slate-400">{section.description}</p>
                  </div>
                  <span className="text-base text-slate-400">{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen ? (
                  <div className="mt-4 space-y-4 text-sm">
                    {section.id === 'info' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="title" required className="text-sm font-semibold">Title</Label>
                          <Input
                            id="title"
                            placeholder="25% off Brunch"
                            className="h-11"
                            {...register('title', { required: 'Title is required' })}
                          />
                          {errors.title ? <p className="text-xs text-rose-300">{errors.title.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the perk and how to redeem"
                            rows={4}
                            className="min-h-[120px]"
                            {...register('description')}
                          />
                          {errors.description ? <p className="text-xs text-rose-300">{errors.description.message}</p> : null}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="discount" required className="text-sm font-semibold">Discount (%)</Label>
                            <Input
                              id="discount"
                              type="number"
                              min={1}
                              max={100}
                              placeholder="25"
                              className="h-11"
                              {...register('discount', {
                                required: 'Discount is required',
                                valueAsNumber: true,
                                min: { value: 1, message: 'Discount must be between 1 and 100' },
                                max: { value: 100, message: 'Discount must be between 1 and 100' }
                              })}
                            />
                            {errors.discount ? <p className="text-xs text-rose-300">{errors.discount.message}</p> : null}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supply" required className="text-sm font-semibold">Supply</Label>
                            <Input
                              id="supply"
                              type="number"
                              min={1}
                              className="h-11"
                              {...register('supply', {
                                required: 'Supply is required',
                                valueAsNumber: true,
                                min: { value: 1, message: 'Supply must be at least 1' }
                              })}
                            />
                            {errors.supply ? <p className="text-xs text-rose-300">{errors.supply.message}</p> : null}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiresAt" required className="text-sm font-semibold">Expires At</Label>
                          <Input
                            id="expiresAt"
                            type="datetime-local"
                            className="h-11"
                            {...register('expiresAt', { required: 'Expiry date is required' })}
                          />
                          {errors.expiresAt ? <p className="text-xs text-rose-300">{errors.expiresAt.message}</p> : null}
                        </div>
                      </>
                    ) : null}
                    {section.id === 'media' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl" className="text-sm font-semibold">Image URL</Label>
                          <Input id="imageUrl" placeholder="https://..." className="h-11" {...register('imageUrl')} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tagsText" className="text-sm font-semibold">Tags</Label>
                          <Input
                            id="tagsText"
                            placeholder="Food, Drinks"
                            className="h-11"
                            {...register('tagsText')}
                          />
                          <p className="text-xs text-slate-400">Separate with commas to help shoppers filter deals.</p>
                        </div>
                      </>
                    ) : null}
                    {section.id === 'review' ? (
                      <div className="space-y-3 text-sm text-slate-300">
                        <p>Double-check supply, expiry window, and imagery. All information becomes part of the on-chain metadata.</p>
                        <p>You can still edit Supabase metadata later, but NFT details are immutable once minted.</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="h-12 w-full rounded-2xl text-base font-semibold"
          >
            {isSubmitting ? 'Minting…' : 'Mint NFT Deal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
