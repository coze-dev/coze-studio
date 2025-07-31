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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircle } from '@coze-arch/coze-design/icons';
import { EmptyState, Spin } from '@coze-arch/coze-design';

import { type EmptyProps } from './type';

import s from './index.module.less';

/* Plugin header */

function Index(props: EmptyProps) {
  const {
    isLoading,
    loadRetry,
    isError,
    renderEmpty,
    text,
    btn,
    icon,
    className,
    size,
  } = props;
  return (
    <div className={s['height-whole-100']}>
      {renderEmpty?.(props) ||
        (!isError ? (
          isLoading ? (
            <Spin
              tip={
                <span className={s['loading-text']}>{I18n.t('Loading')}</span>
              }
              wrapperClassName={s.spin}
              size="middle"
            />
          ) : (
            <div className={className}>
              <EmptyState
                title={text?.emptyTitle || I18n.t('inifinit_list_empty_title')}
                size={size}
                description={text?.emptyDesc || ''}
                buttonText={btn?.emptyText}
                buttonProps={btn?.emptyButtonProps}
                onButtonClick={btn?.emptyClick}
                icon={icon}
              />
            </div>
          )
        ) : (
          <div className={className}>
            <EmptyState
              className={s['load-fail']}
              title={I18n.t('inifinit_list_load_fail')}
              icon={<IconCozWarningCircle />}
              buttonText={loadRetry && I18n.t('inifinit_list_retry')}
              onButtonClick={() => {
                loadRetry?.();
              }}
            />
          </div>
        ))}
    </div>
  );
}

export default Index;
