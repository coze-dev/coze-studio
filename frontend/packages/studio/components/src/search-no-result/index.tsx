import React from 'react';

import classnames from 'classnames';
import { useTheme } from '@coze-arch/coze-design';

import { SearchNoMask } from './mask';
import { SearchNoCard, type CardProps } from './card';

import s from './index.module.less';

interface Props {
  title: string;
  description?: string;
  className?: string;
  type: CardProps['type'];
  cardPosition?: CardProps['position'];
  isNotFound?: boolean;
  notFound?: string;
  button?: React.ReactElement | null;
  children?: React.ReactNode;
  cardClassName?: string;
  textClassName?: string;
}

export function SearchNoResult({
  title,
  description = '',
  className,
  type,
  button,
  notFound = '',
  isNotFound = true,
  cardPosition = 'bottom',
  cardClassName,
  textClassName,
}: Props) {
  const { theme } = useTheme();
  return (
    <div className={classnames(s['search-no-result'], className)}>
      <div className={classnames(s['search-no-wrapper'], cardClassName)}>
        <SearchNoMask theme={theme} />
        <SearchNoCard theme={theme} position={cardPosition} type={type} />
      </div>
      <div className={classnames(s['search-no-tips'], textClassName)}>
        <div
          className={classnames(
            s['search-no-title'],
            'coz-fg-plus text-center font-normal',
          )}
        >
          {notFound !== '' ? notFound : title}
        </div>
        <div
          className={classnames(
            s['search-no-desc'],
            'coz-fg-dim text-center font-normal',
            {
              hidden: isNotFound,
            },
          )}
        >
          {description}
        </div>
        <div>{!isNotFound && button}</div>
      </div>
    </div>
  );
}
