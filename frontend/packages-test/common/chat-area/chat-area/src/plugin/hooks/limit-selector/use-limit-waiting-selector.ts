import { isEqual } from 'lodash-es';

import { type LimitWaitingSelector } from '../../types/plugin-class/selector';
import { type Selector } from '../../types';
import { useChatAreaStoreSet } from '../../../hooks/context/use-chat-area-context';

export const useLimitWaitingSelector: Selector<LimitWaitingSelector> = ({
  selector,
  equalityFn,
}) => {
  const { useWaitingStore } = useChatAreaStoreSet();

  return useWaitingStore(
    selector,
    equalityFn ?? ((prev, next) => isEqual(prev, next)),
  );
};
