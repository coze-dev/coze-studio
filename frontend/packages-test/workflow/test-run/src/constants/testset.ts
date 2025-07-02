/**
 * testset 列表分页大小
 */
export const TESTSET_PAGE_SIZE = 10;

/** test set connector ID 是一个固定的字符串 */
export const TESTSET_CONNECTOR_ID = '10000';

export enum FormItemSchemaType {
  STRING = 'string',
  BOT = 'bot',
  CHAT = 'chat',
  NUMBER = 'number',
  OBJECT = 'object',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
  FLOAT = 'float',
  LIST = 'list',
  TIME = 'time',
}

export enum TestsetFormValuesForBoolSelect {
  TRUE = 'true',
  FALSE = 'false',
  UNDEFINED = 'undefined',
}

/** 布尔类型选项 */
export const TESTSET_FORM_BOOLEAN_SELECT_OPTIONS = [
  {
    value: TestsetFormValuesForBoolSelect.TRUE,
    label: 'true',
  },
  {
    value: TestsetFormValuesForBoolSelect.FALSE,
    label: 'false',
  },
];

/** bot testset key */
export const TESTSET_BOT_NAME = '_WORKFLOW_VARIABLE_NODE_BOT_ID';
