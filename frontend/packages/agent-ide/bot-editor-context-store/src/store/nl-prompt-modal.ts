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
