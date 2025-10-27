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
      <CardHeader title="Create Deal" subtitle="Publish a new promotion as an NFT coupon" />
      <CardContent>
        <form className="space-y-5" onSubmit={submitHandler}>
          <div className="space-y-1">
            <Label htmlFor="title" required>Title</Label>
            <Input id="title" placeholder="eg. 25% off Brunch" {...register('title', { required: 'Title is required' })} />
            {errors.title ? <p className="text-xs text-red-400">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the benefit and redemption instructions"
              rows={4}
              {...register('description')}
            />
            {errors.description ? <p className="text-xs text-red-400">{errors.description.message}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="discount" required>Discount</Label>
              <Input
                id="discount"
                type="number"
                min={1}
                max={100}
                placeholder="25"
                {...register('discount', {
                  required: 'Discount is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Discount must be between 1 and 100' },
                  max: { value: 100, message: 'Discount must be between 1 and 100' }
                })}
              />
              {errors.discount ? <p className="text-xs text-red-400">{errors.discount.message}</p> : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="supply" required>Supply</Label>
              <Input
                id="supply"
                type="number"
                min={1}
                {...register('supply', {
                  required: 'Supply is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Supply must be at least 1' }
                })}
              />
              {errors.supply ? <p className="text-xs text-red-400">{errors.supply.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="expiresAt" required>Expires At</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register('expiresAt', { required: 'Expiry date is required' })}
              />
              {errors.expiresAt ? <p className="text-xs text-red-400">{errors.expiresAt.message}</p> : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" placeholder="https://..." {...register('imageUrl')} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tagsText">Tags (comma separated)</Label>
            <Input id="tagsText" placeholder="Food, Drinks" {...register('tagsText')} />
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Mint NFT Deal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
