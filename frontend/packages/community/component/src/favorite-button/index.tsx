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

import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type MouseEvent,
} from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { UIButton } from '@coze-arch/bot-semi';

import { type FavoriteIconBtnRef, FavoriteIconBtn } from '../favorite-icon-btn';

import styles from './index.module.less';

interface HeaderProps {
  favoriteCount?: number;
  productId?: string;
  entityType?: number;
  isFavorite?: boolean;
  svgColor?: 'default' | 'dark';
  onReportFavorite: (action) => void;
  disabled?: boolean;
  isMobile?: boolean;
  unCollectedIconCls?: string;
  collectedIconCls?: string;
  onClickBefore?: (
    action: 'cancel' | 'add',
    event?: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => boolean | Promise<boolean>;
  /**Compatible with UI 1.0 & 2.0 Remove after all replacements */
  isNewStyle?: boolean;
  isForbiddenIconClick?: boolean;
}

/* Plugin header */

export const FavoriteBtn = forwardRef((props: HeaderProps, ref) => {
  const {
    favoriteCount,
    onReportFavorite,
    productId,
    entityType,
    isFavorite,
    svgColor,
    disabled,
    isMobile,
    isNewStyle,
    collectedIconCls,
    unCollectedIconCls,
    onClickBefore,
    isForbiddenIconClick,
  } = props;
  const refFavoriteBtn = useRef<FavoriteIconBtnRef>(null);
  const [favoriteNumberAdd, setFavoriteNumberAdd] = useState(0);

  // The number cannot be less than 0 to prevent abnormal numbers
  const favoriteNum = Math.max(
    0,
    (Number(favoriteCount) || 0) + (Number(favoriteNumberAdd) || 0),
  );

  useImperativeHandle(
    ref,
    () => ({
      favorite: (event?: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) =>
        refFavoriteBtn.current?.favorite(event),
    }),
    [],
  );
  const favoriteIconButton = (
    <FavoriteIconBtn
      ref={refFavoriteBtn}
      productId={productId}
      entityType={entityType}
      isFavorite={isFavorite}
      onClickBefore={onClickBefore}
      isVisible={true}
      onReportTea={onReportFavorite}
      className={collectedIconCls}
      unCollectedIconCls={cls(styles['un-collected'], unCollectedIconCls)}
      isForbiddenClick={isForbiddenIconClick}
      onChange={value => {
        setFavoriteNumberAdd(prevNumber =>
          //The value is between 1 and -1.
          Math.min(Math.max(prevNumber + (Number(value) || 0), -1), 1),
        );
      }}
      isMobile={isMobile}
    />
  );
  return isMobile ? (
    <div
      onClick={event => {
        if (!isForbiddenIconClick) {
          refFavoriteBtn.current?.favorite(event);
        }
      }}
    >
      {favoriteIconButton}
    </div>
  ) : isNewStyle ? (
    <Button
      size="large"
      color="primary"
      icon={favoriteIconButton}
      onClick={event => {
        refFavoriteBtn.current?.favorite(event);
      }}
      disabled={disabled}
    >
      {favoriteNum > 0
        ? `${I18n.t('mkpl_num_favorites')}(${favoriteNum})`
        : I18n.t('mkpl_num_favorites')}
    </Button>
  ) : (
    <UIButton
      theme={'light'}
      // @ts-expect-error -- linter-disable-autofix
      className={cls(styles['favorite-btn'], styles[svgColor])}
      icon={favoriteIconButton}
      onClick={event => {
        refFavoriteBtn.current?.favorite(event);
      }}
      disabled={disabled}
    >
      {favoriteNum > 0 ? favoriteNum : I18n.t('mkpl_favorite')}
    </UIButton>
  );
});
