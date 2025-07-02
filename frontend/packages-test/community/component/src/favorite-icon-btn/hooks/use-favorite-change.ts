import { useState, useCallback, useRef, type MouseEvent } from 'react';

import { useMemoizedFn, useUpdateEffect } from 'ahooks';

import { type FavoriteCommParams } from '../type';
import { useFavoriteStatusRequest } from './use-farvorite-request';
import { useAnimationChange } from './use-animation-change';

type ClickAction = 'cancel' | 'add';
const getClickAction = (isCurFavoriteStatus: boolean): ClickAction =>
  isCurFavoriteStatus ? 'cancel' : 'add';

export const useFavoriteChange = ({
  isFavoriteDefault,
  onReportTea,
  productId,
  entityId,
  entityType,
  onChange,
  onClickBefore,
  topicId,
  isVisible,
  onFavoriteStateChange,
}: FavoriteCommParams & {
  onReportTea?: (action: 'cancel' | 'add') => void;
  isFavoriteDefault?: boolean;
  isVisible?: boolean;
  onFavoriteStateChange?: (isFavorite: boolean) => void;
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    isFavoriteDefault ?? false,
  );
  const { isShowAni, changeAnimationStatus } = useAnimationChange({
    isVisible,
  });
  const refIsChange = useRef(false);

  // 改变状态前，先做前置请求，判断是否需要放弃本次状态变更，如果 onClickBefore 返回 false，则不进行变更。
  const onClickBeforeHandle = useMemoizedFn(
    async (
      action: ClickAction,
      event?: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    ) => (await onClickBefore?.(action, event)) !== false,
  );
  const { changeFavoriteStatus } = useFavoriteStatusRequest({
    productId,
    entityType,
    entityId,
    topicId,
    onChange,
    setIsFavorite,
  });

  const onClick = useCallback(
    async (event?: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
      if (refIsChange.current) {
        // 进行中，直接返回，不做处理
        event?.stopPropagation?.();
        event?.preventDefault?.();
        return;
      }
      const action = getClickAction(isFavorite);
      refIsChange.current = true;
      try {
        if ((await onClickBeforeHandle(action, event)) !== false) {
          event?.stopPropagation?.();
          onReportTea?.(action);
          changeAnimationStatus(isFavorite);
          await changeFavoriteStatus(isFavorite, action);
        }
      } catch (_err) {
        console.error('useFavoriteChange:', _err);
      }
      refIsChange.current = false;
    },
    [isFavorite, onReportTea],
  );

  useUpdateEffect(() => {
    onFavoriteStateChange?.(isFavorite);
  }, [isFavorite]);
  return { isFavorite, onClick, isShowAni };
};
