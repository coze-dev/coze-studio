import { type MouseEvent } from 'react';

export interface FavoriteCommParams {
  topicId?: string;
  productId?: string;
  entityType?: number;
  isFavorite?: boolean;
  useButton?: boolean;
  entityId?: string;
  onClickBefore?: (
    action: 'cancel' | 'add',
    event?: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => boolean | Promise<boolean>;
  onChange?: (num) => void; // 当收藏状态真正变化的时候，回调
}

export interface FavoriteIconBtnProps extends FavoriteCommParams {
  onFavoriteStateChange?: (isFavorite: boolean) => void; // 当收藏icon的显示状态变化的时候，回调
  isVisible: boolean;
  onReportTea?: (action: 'cancel' | 'add') => void;
  unCollectedIconCls?: string;
  isMobile?: boolean;
  isForbiddenClick?: boolean;
  className?: string;
}
