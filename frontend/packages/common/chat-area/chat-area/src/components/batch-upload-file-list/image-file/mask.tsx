import { type PropsWithChildren } from 'react';

import { IconRefresh } from '@coze-arch/bot-icons';
import { IconSpin } from '@douyinfe/semi-icons';

import { FileStatus, type FileData } from '../../../store/types';
import { useRetryUpload } from '../../../hooks/file/use-upload';

import s from './index.module.less';

const BaseMask: React.FC<PropsWithChildren> = ({ children }) => (
  <div className={s.mask}>{children}</div>
);
export const ImageFileMask: React.FC<FileData> = ({ file, status, id }) => {
  const retryUpload = useRetryUpload();
  const onRetry = () => {
    retryUpload(id, file);
  };

  if (status === FileStatus.Success) {
    return null;
  }

  return (
    <BaseMask>
      {status === FileStatus.Error && (
        <IconRefresh onClick={onRetry} className={s['icon-refresh']} />
      )}
      {(status === FileStatus.Init || status === FileStatus.Uploading) && (
        <IconSpin spin />
      )}
    </BaseMask>
  );
};
