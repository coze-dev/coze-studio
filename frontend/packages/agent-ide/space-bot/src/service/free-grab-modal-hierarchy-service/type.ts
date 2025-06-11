import { type FreeGrabModalHierarchyAction } from '@coze-agent-ide/bot-editor-context-store';

export interface ModalHierarchyServiceConstructor {
  registerModal: FreeGrabModalHierarchyAction['registerModal'];
  removeModal: FreeGrabModalHierarchyAction['removeModal'];
  setModalToTopLayer: FreeGrabModalHierarchyAction['setModalToTopLayer'];
  getModalIndex: FreeGrabModalHierarchyAction['getModalIndex'];
}
