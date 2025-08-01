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
  onChange?: (num) => void; // When the collection status really changes, call back
}

export interface FavoriteIconBtnProps extends FavoriteCommParams {
  onFavoriteStateChange?: (isFavorite: boolean) => void; // When the display state of the favorite icon changes, call back
  isVisible: boolean;
  onReportTea?: (action: 'cancel' | 'add') => void;
  unCollectedIconCls?: string;
  isMobile?: boolean;
  isForbiddenClick?: boolean;
  className?: string;
}
