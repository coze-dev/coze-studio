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

import { type SchemaExtractorConfig } from '../../type';
import { SchemaExtractorParserName } from '../../constant';
import { StandardNodeType } from '../../../../types';

export const workflowExtractorConfig: SchemaExtractorConfig = {
  // Start Start Node 1
  [StandardNodeType.Start]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name/description
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // End End Node 2
  [StandardNodeType.End]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding output specified content
      name: 'content',
      path: 'inputs.content.value.content',
    },
  ],
  // LLM Large Model Node 3
  [StandardNodeType.LLM]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding batch value/batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Cue word
      name: 'llmParam',
      path: 'inputs.llmParam',
      parser: SchemaExtractorParserName.LLM_PARAM,
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Plugin Node 4
  [StandardNodeType.Api]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding batch value/batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding input value/input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Code Node 5
  [StandardNodeType.Code]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input value/input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding code content
      name: 'code',
      path: 'inputs.code',
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Knowledge Base Node 6
  [StandardNodeType.Dataset]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding knowledge base name
      name: 'datasetParam',
      path: 'inputs.datasetParam',
      parser: SchemaExtractorParserName.DATASET_PARAM,
    },
  ],
  // If the decision node 8
  [StandardNodeType.If]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'branches',
      path: 'inputs.branches',
      parser: SchemaExtractorParserName.DEFAULT,
    },
  ],
  // Sub Workflow Node 9
  [StandardNodeType.SubWorkflow]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding batch value/batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding input value/input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Variable Node 11
  [StandardNodeType.Variable]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Database Node 12
  [StandardNodeType.Database]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // sql
      name: 'sql',
      path: 'inputs.sql',
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Message Node 13
  [StandardNodeType.Output]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // content name
      name: 'content',
      path: 'inputs.content.value.content',
    },
  ],
  // Sub ImageFlow Node 14
  [StandardNodeType.Imageflow]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding batch value/batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding input value/input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Text processing node 15
  [StandardNodeType.Text]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Splicing results, and splicing strings
      name: 'concatResult',
      path: 'inputs.concatParams',
      parser: SchemaExtractorParserName.CONCAT_RESULT,
    },
    {
      // Custom array stitching symbols
      name: 'arrayConcatChar',
      path: 'inputs.concatParams',
      parser: SchemaExtractorParserName.CUSTOM_ARRAY_CONCAT_CHAR,
    },
    {
      // custom separator
      name: 'splitChar',
      path: 'inputs.splitParams',
      parser: SchemaExtractorParserName.CUSTOM_SPLIT_CHAR,
    },
  ],
  // Question Node 18
  [StandardNodeType.Question]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Question question
      name: 'question',
      path: 'inputs.question',
    },
    {
      // answer_type answer type option | text
      name: 'answerType',
      path: 'inputs.answer_type',
    },
    {
      // options
      name: 'options',
      path: 'inputs.options',
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Break Stop Loop Node 19
  [StandardNodeType.Break]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
  ],
  // Set Variables Set Variables Node 20
  [StandardNodeType.SetVariable]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.VARIABLE_ASSIGN,
    },
  ],
  // Loop node 21
  [StandardNodeType.Loop]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding variable name
      name: 'variables',
      path: 'inputs.variableParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Intent recognition node 22
  [StandardNodeType.Intent]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // intents
      name: 'intents',
      path: 'inputs.intents',
      parser: SchemaExtractorParserName.INTENTS,
    },
    {
      // system prompt
      name: 'systemPrompt',
      path: 'inputs.llmParam.systemPrompt.value.content',
    },
  ],
  // Knowledge Writing Knowledge Base Writing Node 27
  [StandardNodeType.DatasetWrite]: [
    {
      // Node custom name
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // Corresponding input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // Corresponding knowledge base name
      name: 'datasetParam',
      path: 'inputs.datasetParam',
      parser: SchemaExtractorParserName.DATASET_PARAM,
    },
  ],
};
