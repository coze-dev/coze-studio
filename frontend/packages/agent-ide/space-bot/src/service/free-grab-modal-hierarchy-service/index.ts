/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type FreeGrabModalHierarchyAction } from '@coze-agent-ide/bot-editor-context-store';

import { type ModalHierarchyServiceConstructor } from './type';

export class FreeGrabModalHierarchyService {
  /** Tip: semi modal zIndex is 1000 */
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
