/* eslint-disable @typescript-eslint/no-explicit-any */
export interface QuestionOutputsValue {
  userOutput: Array<any>;
  extractOutput: Array<any>;
  extra_output: boolean;
}

export const formatOutput = (value: QuestionOutputsValue) => {
  const { userOutput, extractOutput, extra_output } = value;

  if (extra_output) {
    return [...userOutput, ...extractOutput];
  }
  return userOutput;
};
