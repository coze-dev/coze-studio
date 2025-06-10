import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface WorkflowState {
  showModalDefault: boolean;
}
interface BotState {
  previousBotID: string;
  modeSwitching: boolean;
}

interface BotPageState {
  bot: BotState;
  tools: {
    workflow: WorkflowState;
  };
}

interface BotPageAction {
  setBotState: (state: Partial<BotState>) => void;
  setWorkflowState: (state: Partial<WorkflowState>) => void;
}

const initialStoreState: BotPageState = {
  bot: { previousBotID: '', modeSwitching: false },
  tools: {
    workflow: {
      showModalDefault: false,
    },
  },
};

const useBotPageStore = create<BotPageState & BotPageAction>()(
  devtools(
    (set, get) => ({
      ...initialStoreState,
      setBotState: nextState => {
        const prevState = get().bot;

        set({
          bot: { ...prevState, ...nextState },
        });
      },
      setWorkflowState: nextState => {
        const prevState = get().tools.workflow;

        set({
          tools: { workflow: { ...prevState, ...nextState } },
        });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botPage',
    },
  ),
);

export { useBotPageStore };
