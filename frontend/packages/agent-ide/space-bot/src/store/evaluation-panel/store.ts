import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface EvaluationPaneState {
  isEvaluationPanelVisible: boolean;
}

interface EvaluationPaneAction {
  setIsEvaluationPanelVisible: (visible: boolean) => void;
}

const DEFAULT_EVALUATION_PANEL_STORE = (): EvaluationPaneState => ({
  isEvaluationPanelVisible: false,
});

export const useEvaluationPanelStore = create<
  EvaluationPaneState & EvaluationPaneAction
>()(
  devtools(
    set => ({
      ...DEFAULT_EVALUATION_PANEL_STORE(),
      setIsEvaluationPanelVisible: visible => {
        set({ isEvaluationPanelVisible: visible });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.evaluationPanelStore',
    },
  ),
);
