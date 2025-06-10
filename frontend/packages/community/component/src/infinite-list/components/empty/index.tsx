import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { UIEmpty, Spin } from '@coze-arch/bot-semi';
import { IllustrationFailure } from '@douyinfe/semi-illustrations';

import { type EmptyProps } from '../../type';

import s from './index.module.less';

/* Plugin header */

function Index(props: EmptyProps) {
  const {
    isLoading,
    isSearching,
    loadRetry,
    isError,
    renderEmpty,
    text,
    btn,
    icon,
  } = props;
  return (
    <div className={s.empty}>
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
            <UIEmpty
              // 理论上不会出现 explore 为空的现象，只可能是搜不到，即 not found
              isNotFound={!!isSearching}
              empty={{
                title: text?.emptyTitle || I18n.t('inifinit_list_empty_title'),
                description: text?.emptyTitle ? text?.emptyDesc : '',
                btnText: btn?.emptyText,
                btnOnClick: btn?.emptyClick,
                icon,
              }}
              notFound={{
                title:
                  text?.searchEmptyTitle || I18n.t('inifinit_search_not_found'),
              }}
            />
          )
        ) : (
          <UIEmpty
            empty={{
              title: I18n.t('inifinit_list_load_fail'),
              icon: <IllustrationFailure />,
              btnText: loadRetry && I18n.t('inifinit_list_retry'),
              btnOnClick: () => {
                loadRetry?.();
              },
            }}
          />
        ))}
    </div>
  );
}

export default Index;
