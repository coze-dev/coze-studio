import {
  type LimitWaitingSelector,
  type SubscriptionSelector,
} from '../../types/plugin-class/selector';
import { type WaitingStore } from '../../../store/waiting';

export const createSubscribeWaiting: SubscriptionSelector<
  LimitWaitingSelector,
  WaitingStore
> =
  (store, usePluginStore) =>
  ({ selector, listener, options }) => {
    const off = store.subscribe(selector, listener, options);
    usePluginStore.getState().appendServiceOffSubscriptionList(off);
    return off;
  };
