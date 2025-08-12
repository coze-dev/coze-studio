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

/** Test set connector ID is a fixed string */
export const TESTSET_CONNECTOR_ID = '10000';

/** This string has no meaning, it is only a marker and cannot be used to determine the start node */
export const START_NODE_ID = '100001';

/*******************************************************************************
 * Log related constants
 */

export enum EndTerminalPlan {
  Variable = 1,
  Text = 2,
}
