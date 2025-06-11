import { type FC } from 'react';

import { ContentBox as UIKitContentBox } from '@coze-common/chat-uikit';

import { type ContentBoxProps } from '../types';
import {
  getIsCardMessage,
  getIsFileMessage,
  getIsImageMessage,
  getIsTextMessage,
} from '../../utils/message';
import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { PluginScopeContextProvider } from '../../plugin/context/plugin-scope-context';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useChatAreaCustomComponent } from '../../hooks/context/use-chat-area-custom-component';
import { useChatAreaContext } from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';

export const BuildInContentBox: FC<ContentBoxProps> = props => {
  const {
    message,
    meta,
    contentConfigs,
    eventCallbacks,
    getBotInfo,
    isContentLoading,
    isCardDisabled,
  } = props;
  const { readonly, layout, enableImageAutoSize } = usePreference();

  const showBackground = useShowBackGround();

  const customContentBoxList = usePluginCustomComponents('ContentBox');
  const customTextMessageInnerTopSlotList = usePluginCustomComponents(
    'TextMessageInnerTopSlot',
  );

  const { lifeCycleService } = useChatAreaContext();
  const { insertedElements } = lifeCycleService.render.onTextContentRendering({
    ctx: {
      insertedElements: [],
      message,
    },
  });

  const componentTypes = useChatAreaCustomComponent();

  const {
    textMessageContentBox: TextMessageContentBox,
    imageMessageContent: ImageMessageContentBox,
    fileMessageContent: FileMessageContentBox,
    cardMessageContent: CardMessageContentBox,
  } = componentTypes;

  if (getIsTextMessage(message) && TextMessageContentBox) {
    return <TextMessageContentBox message={message} meta={meta} />;
  }

  if (getIsImageMessage(message) && ImageMessageContentBox) {
    return <ImageMessageContentBox message={message} meta={meta} />;
  }

  if (getIsFileMessage(message) && FileMessageContentBox) {
    return <FileMessageContentBox message={message} meta={meta} />;
  }

  if (getIsCardMessage(message) && CardMessageContentBox) {
    return <CardMessageContentBox message={message} meta={meta} />;
  }

  if (customContentBoxList.length) {
    return (
      <>
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention -- 符合预期的命名
          customContentBoxList.map(({ pluginName, Component }) => (
            <PluginScopeContextProvider pluginName={pluginName}>
              <Component
                message={message}
                meta={meta}
                contentConfigs={contentConfigs}
                eventCallbacks={eventCallbacks}
                getBotInfo={getBotInfo}
                readonly={readonly}
                layout={layout}
                showBackground={showBackground}
                enableImageAutoSize={enableImageAutoSize}
              />
            </PluginScopeContextProvider>
          ))
        }
      </>
    );
  }

  return (
    <UIKitContentBox
      isContentLoading={isContentLoading}
      mdBoxProps={{
        insertedElements,
      }}
      message={message}
      isCardDisabled={isCardDisabled}
      contentConfigs={contentConfigs}
      eventCallbacks={eventCallbacks}
      getBotInfo={getBotInfo}
      readonly={readonly}
      layout={layout}
      showBackground={showBackground}
      multimodalTextContentAddonTop={
        <>
          {customTextMessageInnerTopSlotList.map(
            // eslint-disable-next-line @typescript-eslint/naming-convention -- 符合预期的命名
            ({ pluginName, Component }, index) => (
              <PluginScopeContextProvider
                pluginName={pluginName}
                key={pluginName}
              >
                <Component key={index} message={message} />
              </PluginScopeContextProvider>
            ),
          )}
        </>
      }
      enableAutoSizeImage={enableImageAutoSize}
    />
  );
};
