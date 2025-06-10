import { isEqual } from 'lodash-es';

import { type LimitSelectionSelector } from '../../types/plugin-class/selector';
import { type Selector } from '../../types';
import { useChatAreaStoreSet } from '../../../hooks/context/use-chat-area-context';

export const useLimitSelectionSelector: Selector<LimitSelectionSelector> = ({
  selector,
  equalityFn,
}) => {
  const { useSelectionStore } = useChatAreaStoreSet();

  return useSelectionStore(
    selector,
    equalityFn ?? ((prev, next) => isEqual(prev, next)),
  );
};
