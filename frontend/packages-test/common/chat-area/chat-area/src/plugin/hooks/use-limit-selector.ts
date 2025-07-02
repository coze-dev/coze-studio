import { useLimitWaitingSelector } from './limit-selector/use-limit-waiting-selector';
import { useLimitSelectionSelector } from './limit-selector/use-limit-selection-selector';
import { useLimitOnboardingSelector } from './limit-selector/use-limit-onboarding-selector';
import { useLimitMessageSelector } from './limit-selector/use-limit-message-selector';
import { useLimitMessageMetaSelector } from './limit-selector/use-limit-message-meta-selector';

export const getLimitSelector = () => ({
  useLimitMessageSelector,
  useLimitMessageMetaSelector,
  useLimitOnboardingSelector,
  useLimitSelectionSelector,
  useLimitWaitingSelector,
});
