import React, { forwardRef, useImperativeHandle } from 'react';

import { type FavoriteIconBtnProps } from './type';
import { useFavoriteChange } from './hooks/use-favorite-change';
import { FavoriteIconMobile } from './components/favorite-icon-mobile';
import { FavoriteIcon } from './components/favorite-icon';

import styles from './index.module.less';

export interface FavoriteIconBtnRef {
  favorite: (event) => void;
}

export const FavoriteIconBtn = forwardRef(
  (props: FavoriteIconBtnProps, ref) => {
    const {
      topicId,
      productId,
      entityType,
      entityId,
      isFavorite: isFavoriteDefault,
      onChange,
      isVisible,
      onReportTea,
      unCollectedIconCls,
      onClickBefore,
      onFavoriteStateChange,
      isMobile,
      className,
      useButton = false,
      isForbiddenClick = false,
    } = props;

    const { isFavorite, onClick, isShowAni } = useFavoriteChange({
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
    });

    useImperativeHandle(
      ref,
      () => ({
        favorite: onClick,
      }),
      [onClick],
    );

    if (!isVisible) {
      return null;
    }
    return (
      <div
        onClick={isForbiddenClick ? undefined : onClick}
        className={styles['favorite-icon-btn']}
        data-testid="bot-card-favorite-icon"
      >
        {isMobile ? (
          <FavoriteIconMobile isFavorite={isFavorite} />
        ) : (
          <FavoriteIcon
            useButton={useButton}
            isFavorite={isFavorite}
            isShowAni={isShowAni}
            unCollectedIconCls={unCollectedIconCls}
            className={className}
          />
        )}
      </div>
    );
  },
);
