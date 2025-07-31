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

import { type SetterExtension } from '@flowgram-adapter/free-layout-editor';
import {
  Boolean,
  Enum,
  EnumImageModel,
  Number,
  String,
} from '@coze-workflow/setters';
import { SizeSelect } from '@coze-workflow/components';

import { viewVariableSelect } from './view-variable-select';
import { variableSelect } from './variable-select';
import { valueExpressionInput } from './value-expression-input';
import { triggerParameterTitle } from './trigger-parameter-title';
import { triggerList } from './trigger-list';
import { triggerBindWorkflow } from './trigger-bind-workflow';
import { toStandardSetter } from './to-standard-setter';
import { timezone } from './timezone';
import { textDisplay } from './text-display';
import { textArea } from './text-area';
import { temperature } from './temperature';
import { systemPrompt } from './system-prompt';
import { switchSetter } from './switch';
import { sql } from './sql';
import { speakerMessageSetArray } from './speaker-message-set-array';
import { slider } from './slider';
import { settingOnErrorSetter } from './setting-on-error';
import { select } from './select';
import { radio } from './radio';
import { questionLimit } from './question-limit';
import { output } from './output-tree';
import { outputLabelTextSetter } from './output-label-text';
import { number } from './number';
import { notify } from './notify';
import { nodeOutputName } from './node-output-name';
import { nodeInputName } from './node-input-name';
import { nodeHeaderSetter } from './node-header';
import { MutableVariableAssign } from './mutable-variable-assign';
import { modelSelect } from './model-select';
import { messageVisibility } from './message-visibility';
import { LoopOutputSelect } from './loop-output-select';
import { localInputSelect } from './local-input-select';
import { jsonEditor } from './json-editor';
import { inputTree } from './input-tree';
import { input } from './input';
import { ImagePreview } from './image-preview';
import { form } from './form';
import { fileUpload } from './file-upload';
import { expressionEditor } from './expression-editor';
import { delimiterSelectorSetter } from './delimiter-selector';
import { DatasetWriteParseSetter } from './dataset-write-parser';
import { DatasetWriteIndexSetter } from './dataset-write-index';
import { DatasetWriteChunkSetter } from './dataset-write-chunk';
import { DatasetSettingSetter } from './dataset-setting';
import { DatasetSelectSetter } from './dataset-select';
import { DatabaseSelect } from './database-select';
import { customPort } from './custom-port';
import { cronJobSelect } from './cronjob-select';
import { condition } from './condition';
import { code } from './code';
import { checkbox } from './checkbox';
import { chatHistory } from './chat-history';
import { canvas } from './canvas';
import { answerOption } from './answer-option';

export const setters: SetterExtension[] = [
  triggerBindWorkflow,
  triggerList,
  triggerParameterTitle,
  jsonEditor,
  fileUpload,
  timezone,
  cronJobSelect,
  input,
  condition,
  form,
  nodeHeaderSetter,
  select,
  switchSetter,
  textArea,
  expressionEditor,
  temperature,
  radio,
  number,
  notify,
  code,
  output,
  inputTree,
  modelSelect,
  variableSelect,
  viewVariableSelect,
  LoopOutputSelect,
  MutableVariableAssign,
  DatasetSelectSetter,
  DatasetWriteIndexSetter,
  DatasetSettingSetter,
  valueExpressionInput,
  nodeInputName,
  nodeOutputName,
  outputLabelTextSetter,
  sql,
  customPort,
  chatHistory,
  systemPrompt,
  delimiterSelectorSetter,
  slider,
  canvas,
  { key: 'string', component: toStandardSetter(String) },
  { key: 'boolean', component: toStandardSetter(Boolean) },
  { key: 'enum', component: toStandardSetter(Enum) },
  { key: 'database-select', component: toStandardSetter(DatabaseSelect) },
  {
    key: 'enum-image-model',
    component: toStandardSetter(EnumImageModel),
  },
  { key: 'number', component: toStandardSetter(Number) },
  { ...expressionEditor, key: 'text' },
  { ...output, key: 'parameters' },
  { ...valueExpressionInput, key: 'expression' },
  { ...radio, key: 'radio' },
  checkbox,
  questionLimit,
  answerOption,
  {
    key: 'image-preview',
    component: ImagePreview,
  },
  messageVisibility,
  textDisplay,
  localInputSelect,
  speakerMessageSetArray,
  { key: 'size-select', component: toStandardSetter(SizeSelect) },
  DatasetWriteParseSetter,
  DatasetWriteChunkSetter,
  settingOnErrorSetter,
];
