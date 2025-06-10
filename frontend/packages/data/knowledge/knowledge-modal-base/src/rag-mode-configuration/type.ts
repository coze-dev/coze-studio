import {
  type KnowledgeShowSourceMode,
  type KnowledgeNoRecallReplyMode,
  type RecallStrategy,
} from '@coze-arch/bot-api/playground_api';
export interface IDataSetInfo {
  min_score: number;
  top_k: number;
  auto: boolean;
  search_strategy?: number;
  show_source?: boolean;
  no_recall_reply_mode?: KnowledgeNoRecallReplyMode;
  no_recall_reply_customize_prompt?: string;
  show_source_mode?: KnowledgeShowSourceMode;
  recall_strategy?: RecallStrategy;
}
export interface RagModeConfigurationProps {
  dataSetInfo: IDataSetInfo;
  onDataSetInfoChange: (v: IDataSetInfo) => void;
  showTitle?: boolean;
  isReadonly?: boolean;
  showNL2SQLConfig?: boolean;
  showAuto?: boolean;
  showSourceDisplay?: boolean;
}
