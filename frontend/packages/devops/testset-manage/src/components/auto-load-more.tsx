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

import { type CSSProperties } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Spin } from '@coze-arch/bot-semi';

import s from './auto-load-more.module.less';

interface LoadMoreProps {
  loadingMore?: boolean;
  noMore?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function AutoLoadMore({
  loadingMore,
  noMore,
  className,
  style,
}: LoadMoreProps) {
  if (noMore || !loadingMore) {
    return null;
  }

  return (
    <div className={cls(s.container, className)} style={style}>
      <Spin spinning={true} wrapperClassName={s.spin} />
      <div className={s.text}>{I18n.t('loading')}</div>
    </div>
  );
}
