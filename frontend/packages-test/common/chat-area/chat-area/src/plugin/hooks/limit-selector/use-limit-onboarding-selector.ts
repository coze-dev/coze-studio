import { isEqual } from 'lodash-es';

import { type LimitOnboardingSelector } from '../../types/plugin-class/selector';
import { type Selector } from '../../types';
import { useChatAreaStoreSet } from '../../../hooks/context/use-chat-area-context';

export const useLimitOnboardingSelector: Selector<LimitOnboardingSelector> = ({
  selector,
  equalityFn,
}) => {
  const { useOnboardingStore } = useChatAreaStoreSet();

  return useOnboardingStore(
    selector,
    equalityFn ?? ((prev, next) => isEqual(prev, next)),
  );
};
