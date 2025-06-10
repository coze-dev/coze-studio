import { WORKFLOW_INNER_SIDE_SHEET_HOLDER } from '../constants';

export const getWorkflowInnerSideSheetHolder = () => {
  const workflowContent = document.querySelector<HTMLElement>(
    `#${WORKFLOW_INNER_SIDE_SHEET_HOLDER}`,
  );
  if (workflowContent) {
    return workflowContent;
  } else {
    return document.body;
  }
};
