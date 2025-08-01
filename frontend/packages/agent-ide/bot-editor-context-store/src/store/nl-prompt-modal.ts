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

import { type NLPromptModalPosition } from './type';

export interface NLPromptModalState {
  visible: boolean;
  position: NLPromptModalPosition;
}

export interface NLPromptModalAction {
  setVisible: (visible: boolean) => void;
  updatePosition: (
    updateFn: (position: NLPromptModalPosition) => NLPromptModalPosition,
  ) => void;
}

export const createNLPromptModalStore = () =>
  create<NLPromptModalState & NLPromptModalAction>()(
    devtools(
      (set, get) => ({
        visible: false,
        position: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        },
        setVisible: visible => set({ visible }, false, 'setVisible'),
        updatePosition: updateFn => {
          const { position } = get();
          set({ position: updateFn(position) }, false, 'updatePosition');
        },
      }),
      {
        enabled: IS_DEV_MODE,
        name: 'botStudio.botEditor.NLPromptModal',
      },
    ),
  );

export type NLPromptModalStore = ReturnType<typeof createNLPromptModalStore>;
