import { I18n } from '@coze-arch/i18n';

export const defaultKnowledgeGlobalSetting = {
  auto: false,
  min_score: 0.5,
  no_recall_reply_customize_prompt: I18n.t('No_recall_006'),
  no_recall_reply_mode: 0,
  search_strategy: 0,
  show_source: false,
  show_source_mode: 0,
  top_k: 3,
  use_rerank: true,
  use_rewrite: true,
  use_nl2_sql: true,
};

export const defaultResponseStyleMode = 0;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TypeMap = new Map([
  [1, 'String'],
  [2, 'Integer'],
  [3, 'Number'],
  [4, 'Object'],
  [5, 'Array'],
  [6, 'Bool'],
]);
