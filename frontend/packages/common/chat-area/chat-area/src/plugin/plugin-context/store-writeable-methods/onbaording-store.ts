import { type OnboardingStore } from '../../../store/onboarding';

export const getOnboardingStoreWriteableMethods = (
  useOnboardingStore: OnboardingStore,
) => {
  const { updatePrologue, partialUpdateOnboardingData } =
    useOnboardingStore.getState();

  return { updatePrologue, partialUpdateOnboardingData };
};
