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

import { useMemo } from 'react';

import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { CozAvatar } from '@coze-arch/coze-design';
import { useWorkflowModels } from '@/hooks';
import { Field } from './field';
import hiagentIcon from '@/assets/icons/hiagent.png';
import difyIcon from '@/assets/icons/dify.svg';
import internalAgentIcon from '@/assets/icons/internal-agent.png';

export function Model() {
  const { data } = useWorkflowNode();
  const { models } = useWorkflowModels();

  const { displayName, avatarSrc } = useMemo(() => {
    const model = data?.model;
    if (!model) {
      return { displayName: '', avatarSrc: undefined as string | undefined };
    }

    if (model.isHiagent) {
      if (model.externalAgentPlatform === 'dify') {
        return {
          displayName: `Dify: ${model.modelName ?? ''}`,
          avatarSrc: difyIcon as string | undefined,
        };
      }
      if (model.externalAgentPlatform === 'singleagent') {
        return {
          displayName: `内部智能体: ${model.modelName ?? ''}`,
          avatarSrc: internalAgentIcon as string | undefined,
        };
      }
      return {
        displayName: `HiAgent: ${model.modelName ?? ''}`,
        avatarSrc: hiagentIcon as string | undefined,
      };
    }

    if (model.modelType) {
      const matched = models.find(v => v.model_type === model.modelType);
      if (matched) {
        return {
          displayName: matched.name,
          avatarSrc: matched.model_icon,
        };
      }
    }

    return {
      displayName: model.modelName ?? '',
      avatarSrc: data?.nodeMeta?.icon,
    };
  }, [data?.model, data?.nodeMeta?.icon, models]);

  return (
    <Field label={I18n.t('workflow_detail_llm_model')} isEmpty={!displayName}>
      <div className="flex items-center leading-[20px]">
        <CozAvatar
          size={'mini'}
          shape="square"
          src={[
            avatarSrc,
            models.find(item => item.model_type === data?.model?.modelType)
              ?.model_icon,
          ].find(Boolean)}
          className={'shrink-0 h-4 w-4 mr-1'}
          data-testid="bot-detail.model-config-modal.model-avatar"
        />
        {displayName}
      </div>
    </Field>
  );
}
