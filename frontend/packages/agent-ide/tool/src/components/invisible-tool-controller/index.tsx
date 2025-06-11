import { useEffect, type FC } from 'react';

import { useIsAllToolHidden } from '../../hooks/public/container/use-tool-all-hidden';
import { useAbilityAreaContext } from '../../context/ability-area-context';

type IProps = Record<string, unknown>;

export const InvisibleToolController: FC<IProps> = () => {
  const isAllToolHidden = useIsAllToolHidden();

  const { eventCallbacks, store } = useAbilityAreaContext();
  const { isInitialed } = store.useToolAreaStore();

  useEffect(() => {
    if (!isInitialed) {
      return;
    }
    eventCallbacks?.onAllToolHiddenStatusChange?.(isAllToolHidden);
  }, [isAllToolHidden, isInitialed]);

  return null;
};
