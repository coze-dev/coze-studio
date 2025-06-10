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
        // 检查 value 中是否有对应的变量值，如果有则替换，否则保持原样
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
