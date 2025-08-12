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

export enum SchemaExtractorParserName {
  DEFAULT = 'default',
  INPUT_PARAMETERS = 'inputParameters',
  OUTPUTS = 'outputs',
  DATASET_PARAM = 'datasetParam',
  LLM_PARAM = 'llmParam',
  INTENTS = 'intents',
  CONCAT_RESULT = 'concatResult',
  CUSTOM_ARRAY_CONCAT_CHAR = 'customArrayConcatChar',
  CUSTOM_SPLIT_CHAR = 'customSplitChar',
  REF_INPUT_PARAMETER = 'refInputParameter',
  VARIABLE_ASSIGN = 'variableAssign',
  JSON_STRING_PARSER = 'jsonStringParser',
  IMAGE_REFERENCE_PARSER = 'imageReferenceParser',
  EXPRESSION_PARSER = 'expressionParser',
  VARIABLE_MERGE_GROUPS_PARSER = 'variableMergeGroupsParser',
  DB_FIELDS_PARSER = 'dbFieldsParser',
  DB_CONDITIONS_PARSER = 'dbConditionsParser',
}

export const SYSTEM_DELIMITERS = [
  '\n',
  '\t',
  '.',
  '。',
  ',',
  '，',
  ';',
  '；',
  ' ',
];
