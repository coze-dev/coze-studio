import { isEqual } from 'lodash-es';

import { type LimitMessageSelector } from '../../types/plugin-class/selector';
import { type Selector } from '../../types';
import { useChatAreaStoreSet } from '../../../hooks/context/use-chat-area-context';

export const useLimitMessageSelector: Selector<LimitMessageSelector> = ({
  selector,
  equalityFn,
}) => {
  const { useMessagesStore } = useChatAreaStoreSet();

  return useMessagesStore(
    selector,
    equalityFn ?? ((prev, next) => isEqual(prev, next)),
  );
};
