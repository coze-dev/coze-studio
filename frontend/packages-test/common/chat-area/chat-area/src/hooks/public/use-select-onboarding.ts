import { useMethodCommonDeps } from '../context/use-method-common-deps';
import { type MethodCommonDeps } from '../../plugin/types';
import { type OnboardingSelectChangeParams } from '../../context/chat-area-context/chat-area-callback';

export const useSelectOnboarding = () => {
  const deps = useMethodCommonDeps();

  return getSelectOnboardingImplement(deps);
};

export const getSelectOnboardingImplement =
  (deps: MethodCommonDeps) => async (params: OnboardingSelectChangeParams) => {
    const { context, storeSet } = deps;
    const { eventCallback, lifeCycleService } = context;
    const { useSelectionStore } = storeSet;
    const { setOnboardingSelected, selectedOnboardingId } =
      useSelectionStore.getState();
    const hasSelectedOnboarding = Boolean(selectedOnboardingId);
    setOnboardingSelected(params.selectedId);
    eventCallback?.onOnboardingSelectChange?.(params, hasSelectedOnboarding);
    await lifeCycleService.command.onOnboardingSelectChange({
      ctx: {
        selected: params,
        isAlreadyHasSelect: hasSelectedOnboarding,
        content: params.onboarding.prologue ?? '',
      },
    });
  };
