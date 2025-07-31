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

import { useRef } from 'react';

import classNames from 'classnames';
import { useHover } from 'ahooks';
import { convertBytes, getFileExtensionAndName } from '@coze-common/chat-uikit';
import { I18n } from '@coze-arch/i18n';
import { Typography, UIButton } from '@coze-arch/bot-semi';
import { IconRefresh } from '@coze-arch/bot-icons';

import { DeleteFileButton } from '../delete-file-button';
import { getCommonFileIcon, getFileTypConfig } from '../../../utils/upload';
import { FileStatus, type FileData } from '../../../store/types';
import { useRetryUpload } from '../../../hooks/file/use-upload';
import { ProgressMask } from './mask';

import styles from './index.module.less';

export const CommonFile: React.FC<FileData & { className?: string }> = ({
  file,
  status,
  percent,
  id,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isHover = useHover(ref);
  const retryUpload = useRetryUpload();
  const onRetry = () => retryUpload(id, file);
  const isError = status === FileStatus.Error;
  const isSuccess = status === FileStatus.Success;
  const fileTypeConfig = getFileTypConfig(file);
  const { extension, nameWithoutExtension } = getFileExtensionAndName(
    file.name,
  );

  return (
    <div
      ref={ref}
      className={classNames(
        styles['normal-file'],
        !isSuccess && styles['normal-file-not-success'],
        className,
      )}
    >
      <img
        src={getCommonFileIcon(fileTypeConfig?.fileType)}
        className={styles['file-icon']}
      />
      <div className={styles['file-info']}>
        <Typography.Text
          ellipsis={{ suffix: extension }}
          className={styles['file-name']}
        >
          {nameWithoutExtension}
        </Typography.Text>
        {(status === FileStatus.Init || status === FileStatus.Uploading) && (
          <div className={styles['file-text']}>{percent}%</div>
        )}
        {isError ? (
          <div className={styles['file-error-text']}>
            {I18n.t('multimodal_upload_file')}
          </div>
        ) : null}
        {isSuccess ? (
          <div className={styles['file-text']}>{convertBytes(file.size)}</div>
        ) : null}
      </div>
      {isError ? (
        <UIButton
          icon={<IconRefresh />}
          onClick={onRetry}
          theme="borderless"
          className={styles['retry-button']}
        />
      ) : null}
      {!isError && !isSuccess && <ProgressMask percent={percent} />}
      {isHover ? <DeleteFileButton fileId={id} /> : null}
    </div>
  );
};
