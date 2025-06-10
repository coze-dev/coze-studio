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

/** diff任务相关信息 */
export interface DiffTaskStore {
  /** 当前diff任务类型 */
  diffTask: DiffTaskType;
  /** 是否有继续任务 */
  hasContinueTask: boolean;
  /** 继续任务信息 */
  continueTask: DiffTaskType;
  /** 当前diff任务信息 */
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
