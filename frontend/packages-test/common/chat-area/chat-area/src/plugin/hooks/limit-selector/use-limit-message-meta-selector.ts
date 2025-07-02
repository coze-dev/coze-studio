import { isEqual } from 'lodash-es';

import { type LimitMessageMetaSelector } from '../../types/plugin-class/selector';
import { type Selector } from '../../types';
import { useChatAreaStoreSet } from '../../../hooks/context/use-chat-area-context';

export const useLimitMessageMetaSelector: Selector<
  LimitMessageMetaSelector
> = ({ selector, equalityFn }) => {
  const { useMessageMetaStore } = useChatAreaStoreSet();

  return useMessageMetaStore(
    selector,
    equalityFn ?? ((prev, next) => isEqual(prev, next)),
  );
};
