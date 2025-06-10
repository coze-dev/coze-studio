import { ContentBoxType } from '@coze-common/chat-uikit-shared';
import {
  ContentBox,
  type EnhancedContentConfig,
  ContentType,
} from '@coze-common/chat-uikit';
import { type ComponentTypesMap } from '@coze-common/chat-area';

import { WorkflowRenderEntry } from './components';

const defaultEnable = (value?: boolean) => {
  if (typeof value === 'undefined') {
    return true;
  }
  return value;
};

export const WorkflowRender: ComponentTypesMap['contentBox'] = props => {
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
      {...props}
    />
  );
};
