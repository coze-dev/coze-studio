import { type WaitingStoreStateAction } from '../../../store/waiting';
import { type SelectionStoreStateAction } from '../../../store/selection';
import { type PluginStore } from '../../../store/plugins';
import { type OnboardingStoreStateAction } from '../../../store/onboarding';
import { type MessageStoreStateAction } from '../../../store/messages';
import { type MessageMetaStoreStateAction } from '../../../store/message-meta';
import { type GlobalInitStateAction } from '../../../store/global-init';

export type SubscriptionSelector<T, V> = (
  store: V,
  pluginStore: PluginStore,
) => <U>(params: {
  selector: (state: T) => U;
  listener: (selectedState: U, previousSelectedState: U) => void;
  options?: {
    equalityFn?: (a: U, b: U) => boolean;
  };
}) => () => void;

export type LimitGlobalInitSelector = Pick<GlobalInitStateAction, 'initStatus'>;

export type LimitMessageSelector = Pick<
  MessageStoreStateAction,
  'findMessage' | 'hasMessage'
>;

export type LimitMessageMetaSelector = Pick<
  MessageMetaStoreStateAction,
  'getMetaByMessage'
>;

export type LimitOnboardingSelector = Pick<
  OnboardingStoreStateAction,
  'avatar' | 'name' | 'prologue' | 'suggestions'
>;

export type LimitSelectionSelector = Pick<
  SelectionStoreStateAction,
  'selectedReplyIdList' | 'selectedOnboardingId'
>;

export type LimitWaitingSelector = Pick<
  WaitingStoreStateAction,
  | 'getIsResponding'
  | 'getIsSending'
  | 'getIsWaiting'
  | 'getIsOnlyWaitingSuggestions'
>;
