import { type PropsWithChildren, createContext, useEffect } from 'react';

import { useCreation } from 'ahooks';

import { createOnboardingDirtyLogicCompatibilityStore } from '../../store/onboarding-dirty-logic-compatibility';
import { createNLPromptModalStore } from '../../store/nl-prompt-modal';
import { createModelStore } from '../../store/model';
import { createFreeGrabModalHierarchyStore } from '../../store/free-grab-modal-hierarchy';
import { createDraftBotDatasetsStore } from '../../store/dataset';
import { createDraftBotPluginsStore } from '../../store/bot-plugins';
import { type BotEditorContextProps } from './type';

export const BotEditorContext = createContext<BotEditorContextProps>({
  storeSet: null,
});

export const BotEditorContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const useOnboardingDirtyLogicCompatibilityStore = useCreation(
    () => createOnboardingDirtyLogicCompatibilityStore(),
    [],
  );

  const { useModelStore, unSubscribe } = useCreation(
    () => createModelStore(),
    [],
  );

  useEffect(() => unSubscribe, []);

  const useDraftBotPluginsStore = useCreation(
    () => createDraftBotPluginsStore(),
    [],
  );

  const useDraftBotDataSetStore = useCreation(
    () => createDraftBotDatasetsStore(),
    [],
  );

  const useNLPromptModalStore = useCreation(
    () => createNLPromptModalStore(),
    [],
  );

  const useFreeGrabModalHierarchyStore = useCreation(
    () => createFreeGrabModalHierarchyStore(),
    [],
  );

  return (
    <BotEditorContext.Provider
      value={{
        storeSet: {
          useOnboardingDirtyLogicCompatibilityStore,
          useModelStore,
          useDraftBotPluginsStore,
          useDraftBotDataSetStore,
          useNLPromptModalStore,
          useFreeGrabModalHierarchyStore,
        },
      }}
    >
      {children}
    </BotEditorContext.Provider>
  );
};
