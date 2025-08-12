/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
