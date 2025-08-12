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

import { useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { CustomError } from '@coze-arch/bot-error';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { ModelForm } from '../../model-form';
import { useAgentModelCapabilityCheckAndAlert } from '../../model-capability-confirm-model';
import { ReportEventNames } from '../../../report-events/report-event-names';
import { useHandleModelForm } from '../../../hooks/model-form/use-handle-model-form';

import styles from './index.module.less';

export const MultiAgentModelForm: React.FC<{ agentId: string }> = ({
  agentId,
}) => {
  const { agent, setMultiAgentByImmer } = useMultiAgentStore(
    useShallow(state => ({
      agent: state.agents.find(item => item.id === agentId),
      setMultiAgentByImmer: state.setMultiAgentByImmer,
    })),
  );
  const { ShortMemPolicy } = useModelStore(
    useShallow(state => ({
      ShortMemPolicy: state.config.ShortMemPolicy,
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

  if (!agent) {
    throw new CustomError(
      ReportEventNames.FailedGetAgentById,
      `agentId: ${agentId}`,
    );
  }
  const [modelId, setModelId] = useState(agent.model.model ?? '');

  const { getSchema, handleFormInit, handleFormUnmount } = useHandleModelForm({
    currentModelId: modelId,
    editable: !isReadonly,
    getModelRecord: () => agent.model,
    onValuesChange: ({ values }) => {
      setMultiAgentByImmer(({ agents }) => {
        const target = agents?.find(item => item.id === agentId);
        if (!target) {
          return;
        }
        target.model = {
          model: modelId,
          ...values,
          ShortMemPolicy,
        };
      });
    },
    modelStore,
  });

  const schema = useMemo(
    () =>
      getSchema({
        currentModelId: modelId,
        isSingleAgent: false,
      }),
    [modelId],
  );

  const checkAndAlert = useAgentModelCapabilityCheckAndAlert();

  return (
    <div className={styles['form-wrapper']}>
      <ModelForm
        schema={schema}
        currentModelId={modelId}
        onModelChange={async newId => {
          const res = await checkAndAlert(newId, agent);
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
