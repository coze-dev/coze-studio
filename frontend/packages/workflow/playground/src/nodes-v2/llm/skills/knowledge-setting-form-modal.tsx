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

import { type FC, useState } from 'react';

import { omit } from 'lodash-es';
import {
  RagModeConfiguration,
  type IDataSetInfo,
} from '@coze-data/knowledge-modal-base';
import { I18n } from '@coze-arch/i18n';
import { Button, Modal } from '@coze-arch/coze-design';

import { type KnowledgeGlobalSetting } from './types';
import { defaultKnowledgeGlobalSetting } from './constants';

import styles from './knowledge-setting-form-modal.module.less';

interface KnowledgeSettingFormModalProps {
  visible: boolean;
  setting?: KnowledgeGlobalSetting;
  onSubmit?: (setting?: KnowledgeGlobalSetting) => void;
  onCancel: () => void;
}

export const KnowledgeSettingFormModal: FC<
  KnowledgeSettingFormModalProps
> = props => {
  const { visible, onSubmit } = props;
  const [setting, updateSetting] = useState<KnowledgeGlobalSetting | undefined>(
    props.setting ?? defaultKnowledgeGlobalSetting,
  );

  const handleSubmit = () => {
    onSubmit?.(setting);
  };

  const handleOnChange = (newSetting: IDataSetInfo) => {
    updateSetting({
      use_rerank: newSetting.recall_strategy?.use_rerank ?? true,
      use_rewrite: newSetting.recall_strategy?.use_rewrite ?? true,
      use_nl2_sql: newSetting.recall_strategy?.use_nl2sql ?? true,
      ...omit(newSetting, ['recall_strategy']),
    });
  };

  const getDataSetInfo = (value: KnowledgeGlobalSetting): IDataSetInfo => ({
    recall_strategy: {
      use_rerank: value.use_rerank ?? true,
      use_rewrite: value.use_rewrite ?? true,
      use_nl2sql: value.use_nl2_sql ?? true,
    },
    ...omit(value, ['use_rerank', 'use_rewrite', 'use_nl2_sql']),
  });

  return (
    <Modal
      size="large"
      height={700}
      visible={visible}
      onCancel={props.onCancel}
      title={I18n.t('dataset_settings_title')}
      footer={
        <div>
          <Button color="hgltplus" onClick={handleSubmit}>
            {I18n.t('Save')}
          </Button>
        </div>
      }
    >
      <div className={styles['rag-mode-config-wrapper']}>
        <RagModeConfiguration
          dataSetInfo={getDataSetInfo(setting as KnowledgeGlobalSetting)}
          showTitle={false}
          onDataSetInfoChange={handleOnChange}
          showAuto={false}
          showSourceDisplay={false}
          showNL2SQLConfig
        />
      </div>
    </Modal>
  );
};
