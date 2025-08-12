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

import { useState, useEffect, useCallback, useMemo, type FC } from 'react';

import classNames from 'classnames';
import { IllustrationSuccess } from '@douyinfe/semi-illustrations';
import { abortable, useUnmountSignal } from '@coze-data/utils';
import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import {
  type FileItem,
  type UploadProps,
  type OnChangeProps,
} from '@coze-arch/bot-semi/Upload';
import { IconCozUpload } from '@coze-arch/coze-design/icons';
import { Toast, Upload } from '@coze-arch/coze-design';

import { UNIT_MAX_MB } from '../../constants';
import {
  filterFileListByUnitList,
  filterFileList,
  filterUnitList,
} from './utils';
import { PreviewFile } from './preview-file';
import { customRequest } from './custom-request';
import { getBeforeUpload } from './before-upload';

import styles from './index.module.less';

interface UploadUnitFileProps extends UploadProps {
  unitList: UnitItem[];
  onFinish: (unitList: UnitItem[]) => void;
  limit: number;
  accept: string;
  setUnitList: (unitList: UnitItem[]) => void;
  showIllustration?: boolean;
  maxSizeMB?: number;
}

export const UploadUnitFile: FC<UploadUnitFileProps> = props => {
  const {
    unitList,
    onFinish,
    setUnitList,
    showIllustration = true,
    multiple = true,
    maxSizeMB = UNIT_MAX_MB,
    ...uploadProps
  } = props;
  const { limit } = uploadProps;

  const [fileList, setFileList] = useState<FileItem[]>([]);

  useEffect(() => {
    if (unitList.length < fileList.length) {
      setFileList(filterFileListByUnitList(fileList, unitList));
    }
  }, [unitList.length]);

  const handleAcceptInvalid = useCallback(() => {
    Toast.warning({
      showClose: false,
      content: I18n.t('knowledge_upload_format_error'),
    });
  }, []);

  const signal = useUnmountSignal();

  const handleUploadProcess = abortable((data: OnChangeProps) => {
    setFileList(data.fileList);
    setUnitList(filterFileList(data.fileList));
  }, signal);

  const handleUploadSuccess = abortable(() => {
    onFinish(filterUnitList(unitList, fileList));
  }, signal);

  const uploadDisabled = useMemo(
    () => unitList.length >= limit,
    [unitList, limit],
  );
  const beforeUpload = getBeforeUpload({ maxSizeMB });
  return (
    <Upload
      draggable
      data-testid={KnowledgeE2e.UploadUnitFile}
      multiple={multiple}
      fileList={fileList}
      disabled={uploadDisabled}
      previewFile={PreviewFile}
      onAcceptInvalid={handleAcceptInvalid}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onChange={handleUploadProcess}
      onSuccess={handleUploadSuccess}
      dragIcon={<IconCozUpload className={styles['upload-icon']} />}
      {...uploadProps}
      className={classNames(styles.upload, uploadProps.className)}
    >
      {unitList.length >= limit && showIllustration ? (
        <div
          className={styles['create-enough-file']}
          onClick={e => e.stopPropagation()}
        >
          <IllustrationSuccess className={styles.picture} />
          <div className={styles.text}>
            {I18n.t('knowledge_1218_001', {
              MaxDocs: limit,
            })}
          </div>
        </div>
      ) : null}
    </Upload>
  );
};
