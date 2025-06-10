import { useMemoizedFn } from 'ahooks';
import { type ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';
import { cozeMitt } from '@coze-common/coze-mitt';

import { type FavoriteCommParams } from '../type';
export const useFavoriteStatusRequest = ({
  productId,
  entityType,
  entityId,
  topicId,
  onChange,
  setIsFavorite,
}: FavoriteCommParams & {
  setIsFavorite: (isFavorite: boolean) => void;
}) => {
  const changeFavoriteStatus = useMemoizedFn(
    async (isCurFavorite: boolean, action: string) => {
      setIsFavorite(!isCurFavorite);
      try {
        await ProductApi.PublicFavoriteProduct({
          // 后端不能处理空字符串
          product_id: productId || undefined,
          entity_type: entityType as ProductEntityType,
          is_cancel: isCurFavorite,
          entity_id: entityId,
          topic_id: topicId,
        });
        onChange?.(isCurFavorite ? -1 : 1);
        cozeMitt.emit('refreshFavList', {
          id: entityId,
          numDelta: action === 'add' ? 1 : -1,
          emitPosition: 'favorite-icon-btn',
        });
      } catch (_err) {
        setIsFavorite(isCurFavorite);
      }
    },
  );
  return { changeFavoriteStatus };
};
