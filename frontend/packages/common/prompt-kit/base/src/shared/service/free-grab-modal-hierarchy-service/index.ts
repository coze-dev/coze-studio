import { type ModalHierarchyServiceConstructor } from './type';
import { type FreeGrabModalHierarchyAction } from './store';

export class FreeGrabModalHierarchyService {
  /** Tip: semi modal zIndex 为 1000 */
  private baseZIndex = 1000;
  public registerModal: FreeGrabModalHierarchyAction['registerModal'];
  public removeModal: FreeGrabModalHierarchyAction['removeModal'];
  public onFocus: FreeGrabModalHierarchyAction['setModalToTopLayer'];
  private getModalIndex: FreeGrabModalHierarchyAction['getModalIndex'];

  constructor({
    registerModal,
    removeModal,
    getModalIndex,
    setModalToTopLayer,
  }: ModalHierarchyServiceConstructor) {
    this.registerModal = registerModal;
    this.removeModal = removeModal;
    this.getModalIndex = getModalIndex;
    this.onFocus = setModalToTopLayer;
  }

  public getModalZIndex = (keyOrIndex: string | number) => {
    if (typeof keyOrIndex === 'string') {
      return this.getModalIndex(keyOrIndex) + this.baseZIndex;
    }
    return keyOrIndex + this.baseZIndex;
  };
}
