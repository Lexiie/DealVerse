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
    <Card>
      <CardHeader title="Create Deal" subtitle="Launch a promotion as an NFT coupon" />
      <CardContent>
        <form className="space-y-8" onSubmit={submitHandler}>
          <section className="space-y-4">
            <h2 className="text-[20px] font-semibold leading-tight text-foreground">Deal Info</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" required className="text-[14px] font-medium text-slate-200">Title</Label>
                <Input
                  id="title"
                  placeholder="25% off Brunch"
                  className="h-11"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title ? <p className="text-xs text-rose-300">{errors.title.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[14px] font-medium text-slate-200">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the perk and how to redeem"
                  rows={4}
                  className="min-h-[120px]"
                  {...register('description')}
                />
                {errors.description ? <p className="text-xs text-rose-300">{errors.description.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[20px] font-semibold leading-tight text-foreground">Pricing &amp; Limits</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discount" required className="text-[14px] font-medium text-slate-200">Discount (%)</Label>
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
                <Label htmlFor="supply" required className="text-[14px] font-medium text-slate-200">Total supply</Label>
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
              <Label htmlFor="expiresAt" required className="text-[14px] font-medium text-slate-200">Expires at</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                className="h-11"
                {...register('expiresAt', { required: 'Expiry date is required' })}
              />
              {errors.expiresAt ? <p className="text-xs text-rose-300">{errors.expiresAt.message}</p> : null}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[20px] font-semibold leading-tight text-foreground">Media &amp; Tags</h2>
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-[14px] font-medium text-slate-200">Image URL</Label>
              <Input id="imageUrl" placeholder="https://..." className="h-11" {...register('imageUrl')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagsText" className="text-[14px] font-medium text-slate-200">Tags</Label>
              <Input
                id="tagsText"
                placeholder="Food, Drinks"
                className="h-11"
                {...register('tagsText')}
              />
              <p className="text-xs text-slate-400">Separate with commas so shoppers can filter deals.</p>
            </div>
          </section>

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="h-12 w-full rounded-2xl text-base font-semibold"
            >
              {isSubmitting ? 'Minting…' : 'Mint NFT Deal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
