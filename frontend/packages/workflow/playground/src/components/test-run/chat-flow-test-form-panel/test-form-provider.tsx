import { createContext, useContext, useMemo } from 'react';

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

interface ChatFlowTestFormState {
  visible: boolean;
  hasForm: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: null | Record<string, any>;
}

interface ChatFlowTestFormAction {
  patch: (next: Partial<ChatFlowTestFormState>) => void;
  getFormData: () => ChatFlowTestFormState['formData'];
}

const createChatFlowTestFormStore = () =>
  createWithEqualityFn<ChatFlowTestFormState & ChatFlowTestFormAction>(
    (set, get) => ({
      visible: false,
      hasForm: false,
      formData: null,
      patch: next => set(() => next),
      getFormData: () => get().formData,
    }),
    shallow,
  );

type ChatFlowTestFormStore = ReturnType<typeof createChatFlowTestFormStore>;

const chatFlowTestFormContext = createContext<ChatFlowTestFormStore>(
  {} as unknown as ChatFlowTestFormStore,
);

const useChatFlowTestFormStore = <T,>(
  selector: (s: ChatFlowTestFormState & ChatFlowTestFormAction) => T,
) => {
  const store = useContext(chatFlowTestFormContext);
  return store(selector);
};

const ChatFlowTestFormProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const store = useMemo(() => createChatFlowTestFormStore(), []);

  return (
    <chatFlowTestFormContext.Provider value={store}>
      {children}
    </chatFlowTestFormContext.Provider>
  );
};

export { ChatFlowTestFormProvider, useChatFlowTestFormStore };
