import Tea from '@coze-studio/tea-adapter';

export {
  EVENT_NAMES,
  AddPluginToStoreEntry,
  AddWorkflowToStoreEntry,
  PublishAction,
  AddBotToStoreEntry,
  BotDetailPageAction,
  PluginPrivacyAction,
  PluginMockDataGenerateMode,
  BotShareConversationClick,
  FlowStoreType,
  FlowResourceFrom,
  FlowDuplicateType,
} from '@coze-studio/tea-interface/events';

export type {
  ExploreBotCardCommonParams,
  ShareRecallPageFrom,
  PluginMockSetCommonParams,
  SideNavClickCommonParams,
  UserGrowthEventParams,
  ParamsTypeDefine,

  /**  product event types */
  ProductEventSource,
  ProductEventFilterTag,
  ProductEventEntityType,
  ProductShowFrontParams,
  DocClickCommonParams,
} from '@coze-studio/tea-interface/events';

export default Tea;
