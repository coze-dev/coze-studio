import { WORKFLOW_OUTER_SIDE_SHEET_HOLDER } from '../constants';

export const getWorkflowOuterSideSheetHolder = () => {
  const workflowContent = document.querySelector<HTMLElement>(
    `#${WORKFLOW_OUTER_SIDE_SHEET_HOLDER}`,
  );
  if (workflowContent) {
    return workflowContent;
  } else {
    return document.body;
  }
};
