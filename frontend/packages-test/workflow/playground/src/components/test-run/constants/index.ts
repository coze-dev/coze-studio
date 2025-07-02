export {
  TestFormType,
  FieldName,
  TestRunDataSource,
  SETTING_FIELD_TEMPLATE,
  DEFAULT_FIELD_TEMPLATE,
  NODE_FIELD_TEMPLATE,
  BATCH_FIELD_TEMPLATE,
  INPUT_FIELD_TEMPLATE,
  getBotFieldTemplate,
  getConversationTemplate,
  DATASETS_FIELD_TEMPLATE,
  COMMON_FIELD,
  TYPE_FIELD_MAP,
  TESTSET_CHAT_NAME,
  TESTSET_BOT_NAME,
  INPUT_JSON_FIELD_TEMPLATE,
} from './test-form';

/** test set connector ID 是一个固定的字符串 */
export const TESTSET_CONNECTOR_ID = '10000';

/** 该字符串没有任何意义，仅做一个标记，不可用于判断 start 节点 */
export const START_NODE_ID = '100001';

/*******************************************************************************
 * log 相关的常量
 */

export enum EndTerminalPlan {
  Variable = 1,
  Text = 2,
}
