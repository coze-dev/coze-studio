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
