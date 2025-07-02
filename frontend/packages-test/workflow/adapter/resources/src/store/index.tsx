export enum PublishWorkflowModal {
  PUBLISH_RESULT = 'publishResult',
  WORKFLOW = 'workflow',
  WORKFLOW_INFO = 'workflowDetail',
  WORKFLOW_CASE = 'workflowCase',
}

export const usePublishWorkflowModal = _options => ({
  ModalComponent: null,
  showModal: _modalOptions => null,
  setSpace: _spaceId => null,
});
