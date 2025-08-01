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

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { CheckType } from '@coze-arch/idl/workflow_api';
import { ConnectorClassification } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { FormSelect, type optionRenderProps } from '@coze-arch/coze-design';

import { useProjectPublishStore } from '@/store';

import {
  type ChatflowOptionProps,
  useChatflowOptions,
} from '../hooks/use-chatflow-options';
import { OptionWithTooltip } from './option-with-tooltip';

export const SocialPlatformChatflow: React.FC<{ className?: string }> = ({
  className,
}) => {
  const {
    connectorList,
    selectedConnectorIds,
    socialPlatformChatflow,
    setProjectPublishInfo,
  } = useProjectPublishStore(
    useShallow(state => ({
      connectorList: state.connectorList,
      selectedConnectorIds: state.selectedConnectorIds,
      socialPlatformChatflow: state.socialPlatformChatflow,
      setProjectPublishInfo: state.setProjectPublishInfo,
    })),
  );
  const hasSelectedSocialPlatforms = connectorList.some(
    c =>
      selectedConnectorIds.includes(c.id) &&
      c.connector_classification === ConnectorClassification.SocialPlatform,
  );

  const { chatflowOptions } = useChatflowOptions(CheckType.SocialPublish);

  const handleSelectChatflow = (option: ChatflowOptionProps) => {
    setProjectPublishInfo({
      socialPlatformChatflow: {
        selected_workflows: [
          {
            workflow_id: option.value,
            workflow_name: option.label,
          },
        ],
      },
    });
  };

  return (
    <div className={classNames('w-[50%] pr-[6px]', className)}>
      <FormSelect
        field="social_platform_chatflow"
        noLabel
        label={I18n.t('project_release_chatflow2')}
        placeholder={I18n.t('project_release_chatflow_choose')}
        optionList={chatflowOptions}
        initValue={socialPlatformChatflow?.selected_workflows?.[0]?.workflow_id}
        className="w-full mb-[4px]"
        renderOptionItem={(option: optionRenderProps) => (
          <OptionWithTooltip option={option} tooltip={option.tooltip} />
        )}
        onSelect={(_: unknown, option: unknown) =>
          handleSelectChatflow(option as ChatflowOptionProps)
        }
        rules={[
          // Chatflow is required when SocialPlatform is selected
          { required: hasSelectedSocialPlatforms },
          // Verify that the selected chatflow exists & & is not disabled
          {
            validator: (_rule: unknown, value: unknown) => {
              if (!hasSelectedSocialPlatforms) {
                return true;
              }
              const selected = chatflowOptions?.find(
                option => option.value === (value as string),
              );
              if (!selected) {
                return new Error(I18n.t('project_release_chatflow3'));
              }
              if (selected.disabled) {
                return new Error(selected.tooltip);
              }
              return true;
            },
          },
        ]}
      />
    </div>
  );
};
