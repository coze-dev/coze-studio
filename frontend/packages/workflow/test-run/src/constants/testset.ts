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

/**
 * TestSet List Page Size
 */
export const TESTSET_PAGE_SIZE = 10;

/** Test set connector ID is a fixed string */
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

/** Boolean Type Options */
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
