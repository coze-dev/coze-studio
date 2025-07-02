import { useRequest } from 'ahooks';
import { type ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

export interface CategoryOptions {
  label: string;
  value: string;
}

export function useProductCategoryOptions(entityType: ProductEntityType) {
  const { data: categoryOptions, loading } = useRequest(async () => {
    const res = await ProductApi.PublicGetProductCategoryList({
      need_empty_category: true,
      entity_type: entityType,
    });
    return res.data?.categories?.map(item => ({
      label: item.name,
      value: item.id,
    })) as CategoryOptions[];
  });
  return { categoryOptions, loading };
}
