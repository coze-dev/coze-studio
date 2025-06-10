import React from 'react';

import { Tooltip } from '@coze/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

import s from './index.module.less';

interface TitleAreaProps {
  title: string;
  tip?: string;
  titleClassName?: string;
}
export const TitleArea: React.FC<TitleAreaProps> = ({
  title,
  tip,
  titleClassName,
}) => (
  <div className={s['title-area']}>
    <span className={titleClassName}>{title}</span>
    {!!tip && (
      <Tooltip
        showArrow
        position="top"
        style={{
          maxWidth: '380px',
          padding: '8px 12px',
          borderRadius: '6px',
        }}
        content={tip}
      >
        <IconInfo className={s['title-area-icon']} />
      </Tooltip>
    )}
  </div>
);
