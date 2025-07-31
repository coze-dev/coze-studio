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

import { ContentBoxType } from '@coze-common/chat-uikit-shared';
import {
  ContentBox,
  type EnhancedContentConfig,
  ContentType,
} from '@coze-common/chat-uikit';
import {
  PluginScopeContextProvider,
  usePluginCustomComponents,
  type ComponentTypesMap,
} from '@coze-common/chat-area';

import { WorkflowRenderEntry } from './components';

const defaultEnable = (value?: boolean) => {
  if (typeof value === 'undefined') {
    return true;
  }
  return value;
};

export const WorkflowRender: ComponentTypesMap['contentBox'] = props => {
  const customTextMessageInnerTopSlotList = usePluginCustomComponents(
    'TextMessageInnerTopSlot',
  );
  const enhancedContentConfigList: EnhancedContentConfig[] = [
    {
      rule: ({ contentType, contentConfigs }) => {
        const isCardEnable = defaultEnable(
          contentConfigs?.[ContentBoxType.CARD]?.enable,
        );
        return contentType === ContentType.Card && isCardEnable;
      },
      render: ({ message, eventCallbacks, contentConfigs, options }) => {
        const { isCardDisabled, readonly } = options;

        const { onCardSendMsg } = eventCallbacks ?? {};

        return (
          <WorkflowRenderEntry
            message={message}
            onCardSendMsg={onCardSendMsg}
            readonly={readonly}
            isDisable={isCardDisabled}
          />
        );
      },
    },
  ];
  return (
    <ContentBox
      enhancedContentConfigList={enhancedContentConfigList}
      multimodalTextContentAddonTop={
        <>
          {customTextMessageInnerTopSlotList.map(
            // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the expected naming
            ({ pluginName, Component }, index) => (
              <PluginScopeContextProvider
                pluginName={pluginName}
                key={pluginName}
              >
                <Component key={index} message={props.message} />
              </PluginScopeContextProvider>
            ),
          )}
        </>
      }
      {...props}
    />
  );
};
