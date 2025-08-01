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

import { type NodeResult } from '@coze-workflow/base/api';

function getPromptExecuteValue(
  prompt: string,
  variables: Record<string, string>,
) {
  const regex = /{{(.*?)}}/g;

  const replacedPrompt =
    prompt?.replace(
      regex,
      (match, variable) =>
        // Check whether there is a corresponding variable value in value, and replace it if so, otherwise keep it as it is.
        variables[variable.trim()] || match,
    ) ?? '';

  return replacedPrompt;
}

export const useLLMPromptHistory = (
  prompt: string,
  testRunResult: NodeResult | undefined,
) => {
  const llmInputStr = testRunResult?.input;
  const inputParams = llmInputStr ? JSON.parse(llmInputStr) : {};
  const human = getPromptExecuteValue(prompt, inputParams);
  const ai = testRunResult?.raw_output ?? '';

  return JSON.stringify({
    Human: human,
    Ai: ai,
  });
};
