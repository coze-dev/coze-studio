import { useMethodCommonDeps } from '../context/use-method-common-deps';
import { type MethodCommonDeps } from '../../plugin/types';
import { getSelectOnboardingImplement } from './use-select-onboarding';

export const useUnselectAll = () => {
  const deps = useMethodCommonDeps();
  return getUnselectAllImplement(deps);
};

export const getUnselectAllImplement = (deps: MethodCommonDeps) => () => {
  const { storeSet } = deps;
  const { useSelectionStore } = storeSet;

  const { clearSelectedReplyIdList } = useSelectionStore.getState();
  const selectOnboarding = getSelectOnboardingImplement(deps);
  clearSelectedReplyIdList();

  selectOnboarding({
    selectedId: null,
    onboarding: {},
  });
};
