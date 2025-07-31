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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Spin, UIButton } from '@coze-arch/bot-semi';
import { useIsResponsive } from '@coze-arch/bot-hooks';

import { type FooterProps } from '../../type';

import s from './index.module.less';

/* Plugin header */

function Index(props: FooterProps) {
  const {
    isLoading,
    loadRetry,
    isError,
    renderFooter,
    isNeedBtnLoadMore,
    noMore,
  } = props;
  const isResponsive = useIsResponsive();

  return (
    <div
      className={classNames(s['footer-container'], {
        [s['responsive-foot-container']]: isResponsive,
      })}
    >
      {renderFooter?.(props) ||
        (isLoading ? (
          <>
            <Spin />
            <span className={s.loading}>{I18n.t('Loading')}</span>
          </>
        ) : isError ? (
          <>
            <Spin />
            <span className={s['error-retry']} onClick={loadRetry}>
              {I18n.t('inifinit_list_retry')}
            </span>
          </>
        ) : isNeedBtnLoadMore && !noMore ? (
          <UIButton
            onClick={loadRetry}
            className={s['load-more-btn']}
            theme="borderless"
          >
            {I18n.t('mkpl_load_btn')}
          </UIButton>
        ) : null)}
    </div>
  );
}

export default Index;
