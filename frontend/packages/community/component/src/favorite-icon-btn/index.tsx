/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
