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

import { type FC, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { ModelForm } from '../model-form';
import { useHandleModelForm } from '../../hooks/model-form/use-handle-model-form';

import styles from './index.module.less';

export const SingleAgentModelForm: FC<{
  onBeforeSwitchModel?: (modelId: string) => Promise<boolean>;
}> = ({ onBeforeSwitchModel }) => {
  const { model, setModelByImmer } = useModelStore(
    useShallow(state => ({
      model: state,
      setModelByImmer: state.setModelByImmer,
    })),
  );
  const { storeSet } = useBotEditor();
  const modelStore = storeSet.useModelStore(
    useShallow(state => ({
      onlineModelList: state.onlineModelList,
      offlineModelMap: state.offlineModelMap,
      getModelPreset: state.getModelPreset,
    })),
  );
  const isReadonly = useBotDetailIsReadonly();

  const [modelId, setModelId] = useState(model.config.model ?? '');
  const { getSchema, handleFormInit, handleFormUnmount } = useHandleModelForm({
    currentModelId: modelId,
    editable: !isReadonly,
    getModelRecord: () => model.config,
    onValuesChange: ({ values }) => {
      setModelByImmer(draft => {
        draft.config = {
          model: modelId,
          ...values,
        };
      });
    },
    modelStore,
  });

  const schema = useMemo(
    () =>
      getSchema({
        currentModelId: modelId,
        isSingleAgent: true,
      }),
    [modelId],
  );

  return (
    <div
      className={styles['form-wrapper']}
      data-testid="bot.ide.bot_creator.model_config_form"
    >
      <div className={styles['form-title']}>{I18n.t('model_config_title')}</div>
      <ModelForm
        schema={schema}
        currentModelId={modelId}
        onModelChange={async newId => {
          const res = onBeforeSwitchModel
            ? await onBeforeSwitchModel(newId)
            : true;
          if (res) {
            setModelId(newId);
          }
        }}
        onFormInit={handleFormInit}
        onFormUnmount={handleFormUnmount}
      />
    </div>
  );
};
