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

/* eslint-disable @coze-arch/max-line-per-function -- ChatInput */
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  type RefObject,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import {
  useUIKitCustomComponent,
  ChatInput as UIKitChatInput,
  type InputRefObject,
} from '@coze-common/chat-uikit';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';
import { I18n } from '@coze-arch/i18n';
import {
  type IChatInputProps,
  UploadType,
  type SendFileMessagePayload,
  MAX_FILE_MBYTE,
  Layout,
} from '@coze-common/chat-uikit-shared';

import { BatchUploadFileList } from '../batch-upload-file-list';
import { getSendMultimodalMessageStrategy } from '../../utils/message';
import { isFileCountExceedsLimit } from '../../utils/is-file-count-exceeds-limit';
import {
  type SendMessageParams,
  type SendMessagePayload,
  SendMessageService,
} from '../../service/send-message';
import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { PluginScopeContextProvider } from '../../plugin/context/plugin-scope-context';
import { useBuiltinButtonStatus } from '../../hooks/uikit/use-builtin-button-status';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useCouldSendNewMessage } from '../../hooks/messages/use-stop-responding';
import {
  useSendFileMessage,
  useSendImageMessage,
  useSendMultimodalMessage,
  useSendNormalizedMessage,
  useSendTextMessage,
} from '../../hooks/messages/use-send-message';
import { useClearHistory } from '../../hooks/messages/use-clear-history';
import { useClearContext } from '../../hooks/messages/use-clear-context';
import { useCreateFileAndUpload } from '../../hooks/file/use-upload';
import { usePasteUpload } from '../../hooks/file/use-paste-upload';
import { useGetScrollView } from '../../hooks/context/use-get-scroll-view';
import { useChatAreaCustomComponent } from '../../hooks/context/use-chat-area-custom-component';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';
import { useCopywriting } from '../../context/copywriting';
import { useChatInputProps } from '../../context/chat-input-props';
import {
  FILE_EXCEEDS_LIMIT_I18N_KEY,
  getFileSizeReachLimitI18n,
} from '../../constants/file';

import styles from './index.module.less';

type UploadCallback = (
  uploadType: UploadType,
  payload: SendFileMessagePayload,
) => void;

export interface ChatInputComponentType {
  component: ForwardRefExoticComponent<
    IChatInputProps & RefAttributes<InputRefObject>
  >;
}

type OverrideProps = Omit<
  IChatInputProps,
  'isFileCountExceedsLimit' | 'layout'
>;

export interface ChatInputProps<T extends OverrideProps> {
  /**
   * Props passed to Component of type T.
   */
  componentProps?: T;
  getChatInputController?: (controller: {
    sendMessage: (payload: SendMessagePayload) => void;
  }) => void;
}

export const ChatInputArea = forwardRef<() => InputRefObject | null>(
  (_, ref) => {
    const chatRef = useRef<InputRefObject>(null);
    useImperativeHandle(ref, () => () => {
      if (!chatRef.current) {
        throw new Error('chatRef not ready');
      }
      return chatRef.current;
    });
    return (
      <div className={classNames(styles['chat-input'])}>
        <ChatInput ref={chatRef} component={UIKitChatInput} />
      </div>
    );
  },
);

export const ChatInput: <T extends OverrideProps>(
  props: ChatInputProps<T> &
    ChatInputComponentType & {
      ref: RefObject<InputRefObject>;
    },
) => ReactNode = forwardRef((props, ref) => {
  const {
    component: InputComponent,
    componentProps,
    getChatInputController,
  } = props;
  const { eventCallback, lifeCycleService } = useChatAreaContext();

  const { useBatchFileUploadStore } = useChatAreaStoreSet();
  const { chatInputTooltip } = useChatAreaCustomComponent();

  const multimodalUpload = useCreateFileAndUpload();

  const {
    inputAddonTop: InputAddonTop,
    inputAboveOutside: InputAboveOutside,
    inputRightActions: InputRightActions,
  } = useChatAreaCustomComponent();

  const customInputAddonTopList = usePluginCustomComponents('InputAddonTop');

  const {
    onBeforeSubmit,
    uploadButtonTooltipContent,
    wrapperClassName,
    inputNativeCallbacks,
    safeAreaClassName,
  } = useChatInputProps();

  const showBackground = useShowBackGround();

  const {
    messageWidth,
    readonly,
    uiKitChatInputButtonConfig,
    enableLegacyUpload,
    enableMultimodalUpload,
    showInputArea,
    layout,
    uikitChatInputButtonStatus,
    isInputReadonly,
    fileLimit,
  } = usePreference();
  const getScrollView = useGetScrollView();

  const sendTextMessage = useSendTextMessage();
  const sendImageMessage = useSendImageMessage();
  const sendFileMessage = useSendFileMessage();
  const sendMultimodalMessage = useSendMultimodalMessage();
  const sendNormalizedMessage = useSendNormalizedMessage();
  const filesLength = useBatchFileUploadStore(state => state.fileIdList.length);
  const couldSendMessage = useCouldSendNewMessage();
  const pasteUpload = usePasteUpload();

  const messageService = new SendMessageService({
    methods: {
      sendTextMessage,
      sendMultimodalMessage,
      sendNormalizedMessage,
    },
    storeSets: {
      useBatchFileUploadStore,
    },
  });

  const isSendButtonDisabled = !couldSendMessage;

  const { SendButton } = useUIKitCustomComponent();

  const handleSendLegacyTextMessage = (payload: SendMessagePayload) => {
    sendTextMessage(payload, 'inputAndSend');
  };

  // TODO: encapsulate another hook @gaoyuanhan
  const handleSendMultimodalMessage = (inputPayload: SendMessagePayload) => {
    const fileDataList = useBatchFileUploadStore.getState().getFileDataList();
    const strategy = getSendMultimodalMessageStrategy(
      inputPayload.text,
      fileDataList,
    );

    const payload: SendMessageParams = {
      inputPayload,
      from: 'inputAndSend',
    };

    switch (strategy) {
      case 'text': {
        return messageService.sendTextMessage(payload);
      }
      case 'multimodal': {
        return messageService.sendMultimodalMessage(payload);
      }
      // case 'file': {
      //   return messageService.sendFileMessage(payload);
      // }
      // case 'image': {
      //   return messageService.sendImageMessage(payload);
      // }
      default: {
        safeAsyncThrow('strategy is unknown');
        return;
      }
    }
  };

  const handleSendMessage = (payload: SendMessagePayload) => {
    if (isSendButtonDisabled) {
      return;
    }

    if (enableMultimodalUpload) {
      handleSendMultimodalMessage(payload);
    } else {
      handleSendLegacyTextMessage(payload);
    }

    const scrollView = getScrollView();
    scrollView.scrollToPercentage(1);
  };

  const handleClearHistory = useClearHistory();

  const handleClearContext = useClearContext();

  const buildInButtonStatus: IChatInputProps['buildInButtonStatus'] =
    useBuiltinButtonStatus(uikitChatInputButtonStatus);

  const handleLegacyUpload: UploadCallback = (uploadType, payload) => {
    if (!couldSendMessage) {
      return;
    }

    const scrollView = getScrollView();
    if (uploadType === UploadType.IMAGE) {
      sendImageMessage(payload, 'inputAndSend');
    } else if (uploadType === UploadType.FILE) {
      sendFileMessage(payload, 'inputAndSend');
    }
    scrollView.scrollToPercentage(1);
  };

  const handleMultimodalUpload: UploadCallback = (_uploadType, payload) => {
    const fileId = nanoid();
    multimodalUpload(fileId, payload.file);
  };

  const handleUploadFile: UploadCallback = (...params) => {
    if (enableMultimodalUpload) {
      handleMultimodalUpload(...params);
      return;
    }
    if (enableLegacyUpload) {
      handleLegacyUpload(...params);
    }
  };

  const handleInputClick = async () => {
    eventCallback?.onInputClick?.();
    await lifeCycleService.command.onInputClick();
  };

  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    pasteUpload(e);

    await lifeCycleService.command.onInputPaste({
      ctx: {
        event: e,
      },
    });
  };

  const {
    textareaPlaceholder,
    clearContextTooltipContent,
    textareaBottomTips,
  } = useCopywriting();

  getChatInputController?.({
    sendMessage: handleSendMessage,
  });

  if (!showInputArea) {
    return null;
  }

  return (
    <div style={{ width: messageWidth }} className={wrapperClassName}>
      <InputComponent
        ref={ref}
        isFileCountExceedsLimit={fileCount =>
          isFileCountExceedsLimit({
            fileCount,
            fileLimit,
            existingFileCount: useBatchFileUploadStore
              .getState()
              .getExistingFileCount(),
          })
        }
        rightActions={InputRightActions ? <InputRightActions /> : null}
        inputNativeCallbacks={inputNativeCallbacks}
        onBeforeSubmit={onBeforeSubmit}
        onClearHistory={handleClearHistory}
        onClearContext={handleClearContext}
        onInputClick={handleInputClick}
        buildInButtonStatus={buildInButtonStatus}
        buildInButtonConfig={{
          ...uiKitChatInputButtonConfig,
          isMoreButtonVisible:
            uiKitChatInputButtonConfig.isMoreButtonVisible &&
            (enableLegacyUpload || enableMultimodalUpload),
        }}
        onSendMessage={handleSendMessage}
        onUpload={handleUploadFile}
        aboveOutside={InputAboveOutside && <InputAboveOutside />}
        addonTop={
          <>
            {!!InputAddonTop && <InputAddonTop />}
            {enableMultimodalUpload ? <BatchUploadFileList /> : null}
            {customInputAddonTopList.map(
              /* eslint-disable-next-line @typescript-eslint/naming-convention -- matches the expected naming */
              ({ pluginName, Component }, index) => (
                <PluginScopeContextProvider
                  pluginName={pluginName}
                  key={pluginName}
                >
                  <Component key={index} />
                </PluginScopeContextProvider>
              ),
            )}
          </>
        }
        CustomSendButton={SendButton}
        copywritingConfig={{
          inputPlaceholder: textareaPlaceholder,
          tooltip: {
            sendButtonTooltipContent: I18n.t('mkpl_send_tooltips'),
            moreButtonTooltipContent: uploadButtonTooltipContent,
            clearContextButtonTooltipContent: clearContextTooltipContent,
            clearHistoryButtonTooltipContent: I18n.t('coze_home_delete_btn'),
            audioButtonTooltipContent: I18n.t(
              'chat_input_hover_tip_voice_input_button',
            ),
            keyboardButtonTooltipContent: I18n.t(
              'chat_input_hover_tip_keyboard_input_button',
            ),
          },
          uploadConfig: {
            fileSizeReachLimitToast: getFileSizeReachLimitI18n({
              limitText: `${MAX_FILE_MBYTE}MB`,
            }),
            fileExceedsLimitToast: I18n.t(FILE_EXCEEDS_LIMIT_I18N_KEY),
            fileEmptyToast: I18n.t('upload_empty_file'),
          },
          bottomTips: textareaBottomTips,
        }}
        isReadonly={readonly}
        isInputReadonly={isInputReadonly}
        hasOtherContentToSend={Boolean(filesLength)}
        inputTooltip={chatInputTooltip}
        layout={layout}
        showBackground={showBackground}
        limitFileCount={fileLimit}
        onPaste={handlePaste}
        {...componentProps}
      />
      <div
        className={classNames(
          styles['safe-area'],
          {
            [styles['safe-area-pc'] as string]: layout === Layout.PC,
          },
          safeAreaClassName,
        )}
      />
    </div>
  );
});

ChatInputArea.displayName = 'ChatAreaChatInputArea';
