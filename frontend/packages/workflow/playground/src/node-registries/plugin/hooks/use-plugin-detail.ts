import { useQuery } from '@tanstack/react-query';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

interface Params {
  pluginId: string;
  /** 是否需要请求商店ID，如果是本地开发的插件，没有上架的，不需要请求，直接返回 pluginId 即可 */
  needQuery: boolean;
}

/** 内部缓存，key 为 pluginID, value 为 pluginId 在 store 中的 productId */
const cache = new Map<string, string>();

export function usePluginDetail({ pluginId, needQuery }: Params) {
  const { isLoading, data } = useQuery({
    queryKey: ['plugin-detail', pluginId],
    // 失败重试一次，避免抖动
    retry: 1,
    queryFn: async () => {
      if (!needQuery) {
        return pluginId;
      }

      // 如果命中缓存
      if (cache.get(pluginId)) {
        return cache.get(pluginId);
      }

      const res = await ProductApi.PublicGetProductDetail(
        {
          entity_type: ProductEntityType.Plugin,
          entity_id: pluginId,
          need_audit_failed: true,
          product_id: '',
        },
        {
          __disableErrorToast: true,
        },
      );

      const id = res?.data?.meta_info?.id;
      if (id) {
        cache.set(pluginId, id);
      }

      return id;
    },
  });

  return { isLoading, storePluginId: data };
}
