import React from 'react';

import { IconInfo } from '@coze-arch/bot-icons';
import { Popover } from '@coze-arch/coze-design';

import styles from './index.module.less';

interface TitleAreaProps {
  title: string;
  tipStyle?: Record<string, string | number>;
  tip?: string | React.ReactNode;
}

export function TitleArea({ title, tip, tipStyle = {} }: TitleAreaProps) {
  return (
    <div className={styles['title-area']}>
      {title}
      {!!tip && (
        <Popover
          showArrow
          position="top"
          zIndex={1031}
          style={{
            maxWidth: '276px',
            ...tipStyle,
          }}
          content={tip}
        >
          <IconInfo className={styles['title-area-icon']} />
        </Popover>
      )}
    </div>
  );
}
