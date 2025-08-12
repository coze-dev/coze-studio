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

import type { DatasetParams } from '../../types/data-set';
import type {
  InputValueDTO,
  VariableMetaDTO,
  StandardNodeType,
  ValueExpressionDTO,
} from '../../types';
import type { SchemaExtractorParserName } from './constant';

export type SchemaExtractorConfig = Partial<
  Record<StandardNodeType, SchemaExtractorNodeConfig[]>
>;

export interface SchemaExtractorNodeConfig {
  name: string;
  /** Lodash.get imported parameter format */
  path: string;
  parser?: SchemaExtractorParserName | Function;
  displayName?: string;
}

export interface SchemaExtracted {
  nodeId: string;
  nodeType: StandardNodeType;
  properties: Record<string, unknown>;
}

export type SchemaExtractorParser<
  T extends SchemaExtractorParserName = SchemaExtractorParserName,
> = {
  [SchemaExtractorParserName.DEFAULT]: SchemaExtractorDefaultParser;
  [SchemaExtractorParserName.INPUT_PARAMETERS]: SchemaExtractorInputParametersParser;
  [SchemaExtractorParserName.OUTPUTS]: SchemaExtractorOutputsParser;
  [SchemaExtractorParserName.DATASET_PARAM]: SchemaExtractorDatasetParamParser;
  [SchemaExtractorParserName.LLM_PARAM]: SchemaExtractorLLMParamParser;
  [SchemaExtractorParserName.INTENTS]: SchemaExtractorIntentsParamParser;
  [SchemaExtractorParserName.CONCAT_RESULT]: SchemaExtractorConcatResultParser;
  [SchemaExtractorParserName.CUSTOM_ARRAY_CONCAT_CHAR]: SchemaExtractorArrayConcatCharParser;
  [SchemaExtractorParserName.CUSTOM_SPLIT_CHAR]: SchemaExtractorSplitCharParser;
  [SchemaExtractorParserName.REF_INPUT_PARAMETER]: SchemaExtractorReferencesParser;
  [SchemaExtractorParserName.VARIABLE_ASSIGN]: SchemaExtractorVariableAssignParser;
  [SchemaExtractorParserName.JSON_STRING_PARSER]: SchemaExtractorJSONStringParser;
  [SchemaExtractorParserName.IMAGE_REFERENCE_PARSER]: SchemaExtractorImageReferenceParser;
  [SchemaExtractorParserName.EXPRESSION_PARSER]: SchemaExtractorExpressionParser;
  [SchemaExtractorParserName.VARIABLE_MERGE_GROUPS_PARSER]: SchemaExtractorVariableMergeGroupsParser;
  [SchemaExtractorParserName.DB_FIELDS_PARSER]: SchemaExtractorDbFieldsParser;
  [SchemaExtractorParserName.DB_CONDITIONS_PARSER]: SchemaExtractorDbConditionsParser;
}[T];

export type SchemaExtractorDefaultParser = (arg: unknown) => unknown;
export interface ParsedExpression {
  name: string;
  value: string;
  isImage: boolean;
}

export type SchemaExtractorInputParametersParser = (
  inputParameters: InputValueDTO[] | Record<string, InputValueDTO['input']>,
) => ParsedExpression[];

export type SchemaExtractorDbFieldsParser = (
  inputParameters: Array<[InputValueDTO, InputValueDTO]>,
) => ParsedExpression[];

export type SchemaExtractorDbConditionsParser = (
  inputParameters: Array<InputValueDTO[]>,
) => ParsedExpression[];

export type SchemaExtractorReferencesParser = (
  reference: Record<string, unknown>[],
) => ParsedExpression[];

export type SchemaExtractorOutputsParser = (outputs: VariableMetaDTO[]) => {
  name: string;
  description?: string;
  children?: ReturnType<SchemaExtractorOutputsParser>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  isImage?: boolean;
  // When the default value includes pictures, the picture information is put here separately.
  images?: string[];
}[];

export type SchemaExtractorDatasetParamParser = (outputs: DatasetParams) => {
  datasetList: string[];
};

export type SchemaExtractorLLMParamParser = (llmParam: InputValueDTO[]) => {
  prompt: string;
  systemPrompt: string;
};

export type SchemaExtractorIntentsParamParser = (
  intents: { name: string }[],
) => {
  intent: string;
};

export type SchemaExtractorConcatResultParser = (
  concatParams: InputValueDTO[],
) => string;

export type SchemaExtractorArrayConcatCharParser = (
  concatParams: InputValueDTO[],
) => string;

export type SchemaExtractorSplitCharParser = (
  concatParams: InputValueDTO[],
) => string;

export type SchemaExtractorVariableAssignParser = (
  variableAssigns: {
    left: ValueExpressionDTO;
    right: ValueExpressionDTO;
    input?: ValueExpressionDTO;
  }[],
) => {
  name: string;
  value: string;
}[];

export type SchemaExtractorJSONStringParser = (
  jsonString: string,
) => object | object[] | undefined;

type ImageReferences = Array<{
  url: ValueExpressionDTO;
}>;

export type SchemaExtractorImageReferenceParser = (
  references: ImageReferences,
) => ParsedExpression[];

export type SchemaExtractorExpressionParser = (
  expression: ValueExpressionDTO[] | ValueExpressionDTO,
) => ParsedExpression[];

export interface VariableMergeGroupType {
  name: string;
  variables: ValueExpressionDTO[];
}

export interface ParsedVariableMergeGroups {
  groupName: string;
  variables: ParsedExpression[];
}

export type SchemaExtractorVariableMergeGroupsParser = (
  mergeGroups: VariableMergeGroupType[],
) => ParsedVariableMergeGroups[];
