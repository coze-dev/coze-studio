export {
  type ICardEmptyConfig,
  type ICopywritingConfig,
  type IMessage,
  type IBaseContentProps,
  type IContentConfig,
  type IContentConfigs,
  type ICardCopywritingConfig,
  type IFileCopywritingConfig,
  type IChatUploadCopywritingConfig,
  type IconType,
  Layout,
} from './types/common';

export {
  type IContent,
  type ISuggestionContent,
  type IImageContent,
  type IFileContent,
  type IFunctionCallContent,
  type GetBotInfo,
  type MdBoxProps,
  ContentBoxType,
} from './types/content';

export {
  type ISimpleFunctionContentCopywriting,
  type IChatInputCopywritingConfig,
} from './types/copywriting';

export {
  type IEventCallbacksParams,
  type LinkEventData,
  type IOnLinkClickParams,
  type IOnImageClickParams,
  type IOnCancelUploadParams,
  type IOnRetryUploadParams,
  type IOnSuggestionClickParams,
  type IOnMessageRetryParams,
  type IOnCopyUploadParams,
  type IOnCardSendMsg,
  type IOnCardUpdateStatus,
  type MouseEventProps,
  type IEventCallbacks,
} from './types/event';

export {
  type IFileInfo,
  type IFileUploadInfo,
  type IFileAttributeKeys,
  type IFileCardTooltipsCopyWritingConfig,
} from './types/file';

export { useUiKitEventCenter } from './context/event-center';

export {
  UIKitEvents,
  type UIKitEventMap,
  type UIKitEventCenter,
  type UIKitEventProviderProps,
} from './context/event-center/type';

export {
  UIKitEventContext,
  UIKitEventProvider,
} from './context/event-center/context';

export { useObserveChatContainer } from './context/event-center/hooks';

export {
  UploadType,
  MAX_FILE_MBYTE,
  DEFAULT_MAX_FILE_SIZE,
  ACCEPT_FILE_EXTENSION,
} from './constants/file';

export {
  type MentionList,
  type SendButtonProps,
  type SendFileMessagePayload,
  type SendTextMessagePayload,
  type UiKitChatInputButtonConfig,
  type UiKitChatInputButtonStatus,
  type IChatInputProps,
  type InputMode,
} from './types/chat-input';

export {
  type AudioRecordProps,
  type AudioRecordEvents,
  type AudioRecordOptions,
} from './types/chat-input/audio-record';

export {
  type InputNativeCallbacks,
  type InputState,
  type InputController,
  type OnBeforeProcessKeyDown,
} from './types/chat-input/input-native-callbacks';
