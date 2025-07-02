import {
  type LimitOnboardingSelector,
  type SubscriptionSelector,
} from '../../types/plugin-class/selector';
import { type OnboardingStore } from '../../../store/onboarding';

export const createSubscribeOnboarding: SubscriptionSelector<
  LimitOnboardingSelector,
  OnboardingStore
> =
  (store, usePluginStore) =>
  ({ selector, listener, options }) => {
    const off = store.subscribe(selector, listener, options);
    usePluginStore.getState().appendServiceOffSubscriptionList(off);
    return off;
  };
