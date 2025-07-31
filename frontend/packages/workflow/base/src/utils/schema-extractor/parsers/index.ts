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

import { type SchemaExtractorParser } from '../type';
import { SchemaExtractorParserName } from '../constant';
import { variableMergeGroupsParser } from './variable-merge-groups-parser';
import { variableAssignParser } from './variable-assign';
import { refInputParametersParser } from './ref-input-parameters';
import { outputsParser } from './output';
import { llmParamParser } from './llm-param';
import { jsonStringParser } from './json-string-parser';
import { intentsParser } from './intents';
import { inputParametersParser } from './input-parameters';
import { imageReferenceParser } from './image-reference';
import { expressionParser } from './expression-parser';
import { dbFieldsParser } from './db-fields';
import { dbConditionsParser } from './db-conditions';
import { datasetParamParser } from './dataset-param';
import { splitCharParser } from './custom-split-char';
import { arrayConcatCharParser } from './custom-array-concat-char';
import { concatResultParser } from './concat-result';

export const schemaExtractorParsers: Record<
  SchemaExtractorParserName,
  SchemaExtractorParser
> = {
  [SchemaExtractorParserName.DEFAULT]: t => t,
  [SchemaExtractorParserName.INPUT_PARAMETERS]: inputParametersParser,
  [SchemaExtractorParserName.OUTPUTS]: outputsParser,
  [SchemaExtractorParserName.DATASET_PARAM]: datasetParamParser,
  [SchemaExtractorParserName.LLM_PARAM]: llmParamParser,
  [SchemaExtractorParserName.INTENTS]: intentsParser,
  [SchemaExtractorParserName.CONCAT_RESULT]: concatResultParser,
  [SchemaExtractorParserName.CUSTOM_ARRAY_CONCAT_CHAR]: arrayConcatCharParser,
  [SchemaExtractorParserName.CUSTOM_SPLIT_CHAR]: splitCharParser,
  [SchemaExtractorParserName.REF_INPUT_PARAMETER]: refInputParametersParser,
  [SchemaExtractorParserName.VARIABLE_ASSIGN]: variableAssignParser,
  [SchemaExtractorParserName.JSON_STRING_PARSER]: jsonStringParser,
  [SchemaExtractorParserName.IMAGE_REFERENCE_PARSER]: imageReferenceParser,
  [SchemaExtractorParserName.EXPRESSION_PARSER]: expressionParser,
  [SchemaExtractorParserName.VARIABLE_MERGE_GROUPS_PARSER]:
    variableMergeGroupsParser,
  [SchemaExtractorParserName.DB_FIELDS_PARSER]: dbFieldsParser,
  [SchemaExtractorParserName.DB_CONDITIONS_PARSER]: dbConditionsParser,
};
