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

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/bot-semi';
import {
  ModelFuncConfigStatus,
  ModelFuncConfigType,
} from '@coze-arch/bot-api/developer_api';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

export const useDatasetAutoChangeConfirm = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();
  return async (auto: boolean, modelId: string) => {
    const model = useModelStore.getState().getModelById(modelId);
    if (!model) {
      return true;
    }
    const modelName = model.name;
    const modelConfig = model.func_config;
    const status =
      modelConfig?.[
        auto
          ? ModelFuncConfigType.KnowledgeAutoCall
          : ModelFuncConfigType.KnowledgeOnDemandCall
      ];
    if (
      status === ModelFuncConfigStatus.NotSupport ||
      status === ModelFuncConfigStatus.PoorSupport
    ) {
      const callMethod = auto
        ? I18n.t('dataset_automatic_call')
        : I18n.t('dataset_on_demand_call');
      const toolName = I18n.t('Datasets');
      return new Promise(resolve => {
        const modal = Modal.confirm({
          zIndex: 1031,
          title: I18n.t('confirm_switch_to_on_demand_call', {
            call_method: callMethod,
          }),
          content: {
            [ModelFuncConfigStatus.NotSupport]: I18n.t(
              'switch_to_on_demand_call_warning_notsupported',
              { call_method: callMethod, modelName, toolName },
            ),
            [ModelFuncConfigStatus.PoorSupport]: I18n.t(
              'switch_to_on_demand_call_warning_supportpoor',
              { callMethod, modelName, toolName },
            ),
          }[status],
          onCancel: () => {
            resolve(false);
            modal.destroy();
          },
          onOk: () => {
            resolve(true);
            modal.destroy();
          },
        });
      });
    }
    return true;
  };
};
