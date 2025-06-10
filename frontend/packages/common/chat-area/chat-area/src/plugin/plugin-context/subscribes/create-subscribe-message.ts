import {
  type LimitMessageSelector,
  type SubscriptionSelector,
} from '../../types/plugin-class/selector';
import { type MessagesStore } from '../../../store/messages';

export const createSubscribeMessage: SubscriptionSelector<
  LimitMessageSelector,
  MessagesStore
> =
  (store, usePluginStore) =>
  ({ selector, listener, options }) => {
    const off = store.subscribe(selector, listener, options);
    usePluginStore.getState().appendServiceOffSubscriptionList(off);
    return off;
  };
