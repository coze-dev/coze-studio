import { type FreeGrabModalHierarchyAction } from './store';

export interface ModalHierarchyServiceConstructor {
  registerModal: FreeGrabModalHierarchyAction['registerModal'];
  removeModal: FreeGrabModalHierarchyAction['removeModal'];
  setModalToTopLayer: FreeGrabModalHierarchyAction['setModalToTopLayer'];
  getModalIndex: FreeGrabModalHierarchyAction['getModalIndex'];
}
