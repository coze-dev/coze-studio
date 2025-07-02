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
