import { type FC, type PropsWithChildren } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/bot-semi';

import styles from './index.module.less';

export const FilePopover: FC<
  PropsWithChildren<{
    fileNames: string[];
    showTitle?: boolean;
  }>
> = ({ fileNames = [], showTitle = true, children }) => (
  <Popover
    className={styles.popover}
    content={
      <div>
        {showTitle ? <p>{I18n.t('datasets_processing_notice')}</p> : null}
        <p>{fileNames.join('\n')}</p>
      </div>
    }
  >
    {children}
  </Popover>
);
