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
  // Start 开始节点 1
  [StandardNodeType.Start]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应 input name / description
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // End 结束节点 2
  [StandardNodeType.End]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应输出指定内容
      name: 'content',
      path: 'inputs.content.value.content',
    },
  ],
  // LLM 大模型节点 3
  [StandardNodeType.LLM]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应batch value / batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应提示词
      name: 'llmParam',
      path: 'inputs.llmParam',
      parser: SchemaExtractorParserName.LLM_PARAM,
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Plugin 节点 4
  [StandardNodeType.Api]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应batch value / batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应input value / input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Code 代码节点 5
  [StandardNodeType.Code]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input value / input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应code内容
      name: 'code',
      path: 'inputs.code',
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Knowledge 知识库节点 6
  [StandardNodeType.Dataset]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应知识库名称
      name: 'datasetParam',
      path: 'inputs.datasetParam',
      parser: SchemaExtractorParserName.DATASET_PARAM,
    },
  ],
  // If 判断节点 8
  [StandardNodeType.If]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'branches',
      path: 'inputs.branches',
      parser: SchemaExtractorParserName.DEFAULT,
    },
  ],
  // Sub Workflow 工作流节点 9
  [StandardNodeType.SubWorkflow]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应batch value / batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应input value / input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Variable 变量节点 11
  [StandardNodeType.Variable]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Database 数据库节点 12
  [StandardNodeType.Database]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
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
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Message 消息节点 13
  [StandardNodeType.Output]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
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
  // Sub Imageflow 图像流节点 14
  [StandardNodeType.Imageflow]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应batch value / batch description
      name: 'batch',
      path: 'inputs.batch.inputLists',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应input value / input description
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Text 文本处理节点 15
  [StandardNodeType.Text]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 拼接结果，以及拼接字符串
      name: 'concatResult',
      path: 'inputs.concatParams',
      parser: SchemaExtractorParserName.CONCAT_RESULT,
    },
    {
      // 自定义数组拼接符号
      name: 'arrayConcatChar',
      path: 'inputs.concatParams',
      parser: SchemaExtractorParserName.CUSTOM_ARRAY_CONCAT_CHAR,
    },
    {
      // 自定义分隔符
      name: 'splitChar',
      path: 'inputs.splitParams',
      parser: SchemaExtractorParserName.CUSTOM_SPLIT_CHAR,
    },
  ],
  // Question 问题节点 18
  [StandardNodeType.Question]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // question 问题
      name: 'question',
      path: 'inputs.question',
    },
    {
      // answer_type 回答类型 option|text
      name: 'answerType',
      path: 'inputs.answer_type',
    },
    {
      // options
      name: 'options',
      path: 'inputs.options',
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Break 终止循环节点 19
  [StandardNodeType.Break]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
  ],
  // Set Variable 设置变量节点 20
  [StandardNodeType.SetVariable]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.VARIABLE_ASSIGN,
    },
  ],
  // Loop 循环节点 21
  [StandardNodeType.Loop]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应variable name
      name: 'variables',
      path: 'inputs.variableParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应output name
      name: 'outputs',
      path: 'outputs',
      parser: SchemaExtractorParserName.OUTPUTS,
    },
  ],
  // Intent 意图识别节点 22
  [StandardNodeType.Intent]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
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
  // Knowledge Write 知识库写入节点 27
  [StandardNodeType.DatasetWrite]: [
    {
      // 节点自定义名称
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
    {
      // 对应知识库名称
      name: 'datasetParam',
      path: 'inputs.datasetParam',
      parser: SchemaExtractorParserName.DATASET_PARAM,
    },
  ],
};
