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

import { get } from 'lodash-es';

import { type SchemaExtractorLLMParamParser } from '../type';

export const llmParamParser: SchemaExtractorLLMParamParser = llmParam => {
  const promptItem = llmParam.find(param => param.name === 'prompt');
  const prompt = (get(promptItem, 'input.value.content') as string) || '';
  const systemPromptItem = llmParam.find(
    param => param.name === 'systemPrompt',
  );
  const systemPrompt =
    (get(systemPromptItem, 'input.value.content') as string) || '';
  return {
    systemPrompt,
    prompt,
  };
};
