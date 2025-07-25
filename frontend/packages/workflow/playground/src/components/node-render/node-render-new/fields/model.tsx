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
 
import { useState, useEffect } from 'react';

import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { CozAvatar } from '@coze-arch/coze-design';
import { useWorkflowModels } from '@/hooks';
import { Field } from './field';

export function Model() {
  const { data } = useWorkflowNode();
  const [modelName, setModelName] = useState(data?.model?.modelName);
  const { models } = useWorkflowModels();

  useEffect(() => {
    // fix:
    // 右侧下拉框展示的模型名称取得是 name 字段，而不是 modelName
    // 因此这里需要根据 modeType 找到原来模型，展示 name 字段，保持两侧显示一致
    if (data?.model?.modelType) {
      const model = models.find(v => v.model_type === data?.model?.modelType);
      if (model) {
        setModelName(model.name);
      }
    }
  }, [models, data, data?.model]);

  return (
    <Field label={I18n.t('workflow_detail_llm_model')} isEmpty={!modelName}>
      <div className="flex items-center leading-[20px]">
        <CozAvatar
          size={'mini'}
          shape="square"
          src={
            models.find(item => item.model_type === data?.model?.modelType)
              ?.model_icon
          }
          className={'shrink-0 h-4 w-4 mr-1'}
          data-testid="bot-detail.model-config-modal.model-avatar"
        />
        {modelName}
      </div>
    </Field>
  );
}
