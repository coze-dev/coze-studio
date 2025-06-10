import { type OnboardingDirtyLogicCompatibilityStore } from '../../store/onboarding-dirty-logic-compatibility';
import { type NLPromptModalStore } from '../../store/nl-prompt-modal';
import { type ModelStore } from '../../store/model';
import { type FreeGrabModalHierarchyStore } from '../../store/free-grab-modal-hierarchy';
import { type DraftBotDatasetsStore } from '../../store/dataset';
import { type DraftBotPluginsStore } from '../../store/bot-plugins';

export interface StoreSet {
  useOnboardingDirtyLogicCompatibilityStore: OnboardingDirtyLogicCompatibilityStore;
  useModelStore: ModelStore;
  useDraftBotPluginsStore: DraftBotPluginsStore;
  useDraftBotDataSetStore: DraftBotDatasetsStore;
  useNLPromptModalStore: NLPromptModalStore;
  useFreeGrabModalHierarchyStore: FreeGrabModalHierarchyStore;
}

export interface BotEditorContextProps {
  storeSet: null | StoreSet;
}
