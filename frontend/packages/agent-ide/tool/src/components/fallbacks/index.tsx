import { type FC, useState } from 'react';

import { getSlardarInstance } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconInfoCircle } from '@coze-arch/bot-icons';

import styles from './index.module.less';

interface IProps {
  toolTitle?: string;
}
export const ToolContainerFallback: FC<IProps> = ({ toolTitle }) => {
  const [sessionId] = useState(() => getSlardarInstance()?.config()?.sessionId);

  return (
    <div className={styles['tool-container-fallback']}>
      <IconInfoCircle />
      <span className={styles.text}>
        {toolTitle}
        {I18n.t('tool_load_error')}
      </span>
      {!!sessionId && (
        <div className="leading-[12px] ml-[6px] text-[12px] text-gray-400">
          {sessionId}
        </div>
      )}
    </div>
  );
};
