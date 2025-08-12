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

/* eslint-disable complexity */
import classNames from 'classnames';
import {
  UploadStatus,
  EntityStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, Progress, Spin } from '@coze-arch/bot-semi';
import {
  IconUploadFileSuccess,
  IconUploadFileFail,
} from '@coze-arch/bot-icons';
import { WebStatus } from '@coze-arch/bot-api/knowledge';

import { type UploadStateProps } from '../../types';

import styles from './index.module.less';

export const UploadStatusComp: React.FC<UploadStateProps> = ({
  record,
  onRetry,
  index,
  needLoading,
  overlayClassName,
  disableRetry,
  noRetry,
}) => {
  const { status } = record;
  if (
    status === UploadStatus.UPLOADING ||
    status === UploadStatus.VALIDATING ||
    status === UploadStatus.WAIT ||
    status === WebStatus.Handling ||
    status === EntityStatus.EntityStatusProcess
  ) {
    return (
      <span
        data-dtestid={`${KnowledgeE2e.LocalUploadListStatus}.${record.name}`}
        className={classNames(styles['upload-status-wrap'], overlayClassName)}
      >
        <span>{I18n.t('datasets_unit_upload_state')}</span>
        {needLoading ? (
          <Spin spinning={true} />
        ) : (
          <Progress percent={record.percent} />
        )}
      </span>
    );
  }
  if (
    status === UploadStatus.SUCCESS ||
    status === WebStatus.Finish ||
    status === EntityStatus.EntityStatusSuccess
  ) {
    return (
      <span
        className={styles['upload-status-wrap']}
        data-dtestid={`${KnowledgeE2e.LocalUploadListStatus}.${record.name}`}
      >
        <IconUploadFileSuccess />
        <span>{I18n.t('datasets_unit_upload_success')}</span>
      </span>
    );
  }
  if (status === UploadStatus.VALIDATE_FAIL) {
    return (
      <span
        className={styles['upload-status-wrap']}
        data-dtestid={`${KnowledgeE2e.LocalUploadListStatus}.${record.name}`}
      >
        <IconUploadFileFail />
      </span>
    );
  }
  if (
    status === UploadStatus.UPLOAD_FAIL ||
    status === WebStatus.Failed ||
    status === EntityStatus.EntityStatusFail
  ) {
    return (
      <div
        data-dtestid={`${KnowledgeE2e.LocalUploadListStatus}.${record.name}`}
        className={classNames(
          `${styles['upload-status-wrap']} ${styles.retry}`,
          overlayClassName,
          disableRetry ? styles['disabled-retry'] : '',
          noRetry ? styles['no-retry-text'] : '',
        )}
        onClick={() => {
          !disableRetry && !noRetry && onRetry && onRetry(record, index);
        }}
      >
        {!record.statusDescript ? (
          <IconUploadFileFail />
        ) : (
          <Tooltip content={record.statusDescript} trigger="hover">
            <IconUploadFileFail />
          </Tooltip>
        )}
        {!noRetry && (
          <div className={classNames(styles['retry-text'])}>
            {I18n.t('datasets_unit_update_retry')}
          </div>
        )}
      </div>
    );
  }
  return null;
};
