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

import { useMemo, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconSvgUploadCompletedIcon } from '@coze-arch/bot-icons';

import { useStepStore } from '../../store/step';
import { useInitialConfigStore } from '../../store/initial-config';
import outerStyles from '../../index.module.less';
import { useUploadProgress } from '../../hooks/use-upload-progress';
import { ImportFileTaskStatus } from '../../datamodel';
import { UploadProgress } from './upload-progress';

import styles from './index.module.less';

export const Processing: FC = () => {
  const { currentState, tableStructure, upload } = useStepStore(state => ({
    currentState: state.step4_processing,
    setCurrentState: state.set_step4_processing,
    tableStructure: state.step2_tableStructure,
    upload: state.step1_upload,
  }));

  const { botId } = useInitialConfigStore(state => ({
    botId: state.botId,
  }));

  const { fileList } = upload;
  const { tableValue } = tableStructure;

  const { tableID } = currentState;

  // @ts-expect-error -- linter-disable-autofix
  const progressInfo = useUploadProgress({ tableID, botID: botId });

  const headerTitle = useMemo(() => {
    let msg: string = I18n.t('db_table_0126_029');
    if (progressInfo?.status === ImportFileTaskStatus.Succeed) {
      msg = I18n.t('datasets_createFileModel_step4_Finish');
    } else if (progressInfo?.status === ImportFileTaskStatus.Failed) {
      msg = I18n.t('datasets_createFileModel_step4_failed');
    }
    return msg;
  }, [progressInfo?.status]);

  return (
    <div className={outerStyles.stepWrapper}>
      <div className={styles.text}>{headerTitle}</div>
      <div className={styles['progress-list']}>
        <UploadProgress
          // @ts-expect-error -- linter-disable-autofix
          key={fileList[0].response.upload_uri}
          className={styles['dataset-progress']}
          // @ts-expect-error -- linter-disable-autofix
          text={tableValue.name}
          percent={progressInfo?.progress || 0}
          status={progressInfo?.status || ImportFileTaskStatus.Enqueue}
          statusDesc={''}
          format={percent =>
            percent < 100 ? (
              `${percent}%`
            ) : (
              <IconSvgUploadCompletedIcon
                className={styles['progress-success-icon']}
              />
            )
          }
        />
      </div>
    </div>
  );
};
