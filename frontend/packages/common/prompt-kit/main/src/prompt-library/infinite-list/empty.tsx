import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircle } from '@coze/coze-design/icons';
import { EmptyState, Spin } from '@coze/coze-design';

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
