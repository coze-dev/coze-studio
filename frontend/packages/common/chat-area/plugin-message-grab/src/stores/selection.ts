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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import {
  type SelectionData,
  type GrabNode,
  type GrabPosition,
} from '@coze-common/text-grab';

export interface SelectionState {
  humanizedContentText: string;
  originContentText: string;
  normalizeSelectionNodeList: GrabNode[];
  selectionData: SelectionData | null;
  isFloatMenuVisible: boolean;
  floatMenuPosition: GrabPosition | null;
}

export interface SelectionAction {
  updateHumanizedContentText: (text: string) => void;
  updateOriginContentText: (text: string) => void;
  updateNormalizeSelectionNodeList: (nodeList: GrabNode[]) => void;
  updateSelectionData: (selectionData: SelectionData | null) => void;
  updateIsFloatMenuVisible: (visible: boolean) => void;
  updateFloatMenuPosition: (position: GrabPosition | null) => void;
  clearStore: () => void;
}

export const createSelectionStore = (mark: string) => {
  const useSelectionStore = create<SelectionState & SelectionAction>()(
    devtools(
      (set, get) => ({
        humanizedContentText: '',
        originContentText: '',
        normalizeSelectionNodeList: [],
        selectionData: null,
        isFloatMenuVisible: false,
        floatMenuPosition: null,
        updateHumanizedContentText: text => {
          set({
            humanizedContentText: text,
          });
        },
        updateOriginContentText: text => {
          set({
            originContentText: text,
          });
        },
        updateNormalizeSelectionNodeList: nodeList => {
          set({
            normalizeSelectionNodeList: nodeList,
          });
        },
        updateIsFloatMenuVisible: visible => {
          set({
            isFloatMenuVisible: visible,
          });
        },
        updateSelectionData: selectionData => {
          set({
            selectionData,
          });
        },
        updateFloatMenuPosition: position => {
          set({
            floatMenuPosition: position,
          });
        },
        clearStore: () => {
          set({
            humanizedContentText: '',
            originContentText: '',
            normalizeSelectionNodeList: [],
            selectionData: null,
          });
        },
      }),
      {
        name: `botStudio.ChatAreaGrabPlugin.SelectionStore.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return useSelectionStore;
};

export type SelectionStore = ReturnType<typeof createSelectionStore>;
