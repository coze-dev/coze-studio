import { concatTestId } from '@coze-workflow/base';

type WorkflowHeaderTestId = `workflow.playground.header.${string}`;
export const getWorkflowHeaderTestId = (
  ...args: string[]
): WorkflowHeaderTestId =>
  concatTestId(
    'workflow',
    'playground',
    'header',
    ...args,
  ) as WorkflowHeaderTestId;
