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
