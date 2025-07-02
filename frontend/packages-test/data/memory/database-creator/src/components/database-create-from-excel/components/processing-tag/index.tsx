import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip } from '@coze-arch/bot-semi';

import { useUploadProgress } from '../../hooks/use-upload-progress';
import { ImportFileTaskStatus } from '../../datamodel';

import styles from './index.module.less';

export interface ProcessingTagProps {
  tableID: string;
  botID: string;
}
export const ProcessingTag: FC<ProcessingTagProps> = props => {
  const { tableID, botID } = props;

  const progressInfo = useUploadProgress({ tableID, botID });

  if (progressInfo?.status === ImportFileTaskStatus.Enqueue) {
    return (
      <Tag className={styles['processing-tag-process']}>
        {I18n.t('db_table_0126_031')}: {progressInfo.progress}%
      </Tag>
    );
  }

  if (progressInfo?.status === ImportFileTaskStatus.Failed) {
    return (
      <Tooltip content={progressInfo?.errorMessage}>
        <Tag className={styles['processing-tag-failed']}>
          {I18n.t('db_table_0126_031')}
        </Tag>
      </Tooltip>
    );
  }

  if (progressInfo?.status === ImportFileTaskStatus.Succeed) {
    return null;
  }
  return null;
};
