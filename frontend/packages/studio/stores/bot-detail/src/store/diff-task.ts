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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';

export type DiffTaskType = 'prompt' | 'model' | '';

export const getDefaultDiffTaskStore = (): DiffTaskStore => ({
  diffTask: '',
  hasContinueTask: false,
  continueTask: '',
  promptDiffInfo: {
    diffPromptResourceId: '',
    diffMode: 'draft',
    diffPrompt: '',
  },
});

/** Diff task related information */
export interface DiffTaskStore {
  /** Current diff task type */
  diffTask: DiffTaskType;
  /** Is there a continuation mission? */
  hasContinueTask: boolean;
  /** Continue task information */
  continueTask: DiffTaskType;
  /** Current diff task information */
  promptDiffInfo: {
    diffPromptResourceId: string;
    diffPrompt: string;
    diffMode: 'draft' | 'new-diff';
  };
}

export interface DiffTaskAction {
  setDiffTask: SetterAction<DiffTaskStore>;
  setDiffTaskByImmer: (update: (state: DiffTaskStore) => void) => void;
  enterDiffMode: (props: {
    diffTask: DiffTaskType;
    promptDiffInfo?: {
      diffPromptResourceId: string;
      diffMode: 'draft' | 'new-diff';
      diffPrompt: string;
    };
  }) => void;
  exitDiffMode: () => void;
  clear: () => void;
}

export const useDiffTaskStore = create<DiffTaskStore & DiffTaskAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultDiffTaskStore(),
      setDiffTask: setterActionFactory<DiffTaskStore>(set),
      setDiffTaskByImmer: update =>
        set(produce<DiffTaskStore>(state => update(state))),
      enterDiffMode: ({ diffTask, promptDiffInfo }) => {
        set(
          produce<DiffTaskStore>(state => {
            state.diffTask = diffTask;
          }),
          false,
          'enterDiffMode',
        );
        if (diffTask === 'prompt' && promptDiffInfo) {
          get().setDiffTaskByImmer(state => {
            state.promptDiffInfo = promptDiffInfo;
          });
        }
      },
      exitDiffMode: () => {
        get().clear();
      },
      clear: () => {
        set({ ...getDefaultDiffTaskStore() }, false, 'clear');
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.diffTask',
    },
  ),
);
