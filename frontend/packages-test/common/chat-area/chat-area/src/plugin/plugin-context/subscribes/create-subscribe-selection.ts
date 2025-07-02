import {
  type LimitSelectionSelector,
  type SubscriptionSelector,
} from '../../types/plugin-class/selector';
import { type SelectionStore } from '../../../store/selection';

export const createSubscribeSelection: SubscriptionSelector<
  LimitSelectionSelector,
  SelectionStore
> =
  (store, usePluginStore) =>
  ({ selector, listener, options }) => {
    const off = store.subscribe(selector, listener, options);
    usePluginStore.getState().appendServiceOffSubscriptionList(off);
    return off;
  };
