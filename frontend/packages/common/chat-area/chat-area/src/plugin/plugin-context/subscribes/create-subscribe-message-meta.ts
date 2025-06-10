import {
  type LimitMessageMetaSelector,
  type SubscriptionSelector,
} from '../../types/plugin-class/selector';
import { type MessageMetaStore } from '../../../store/message-meta';

export const createSubscribeMessageMeta: SubscriptionSelector<
  LimitMessageMetaSelector,
  MessageMetaStore
> =
  (store, usePluginStore) =>
  ({ selector, listener, options }) => {
    const off = store.subscribe(selector, listener, options);
    usePluginStore.getState().appendServiceOffSubscriptionList(off);
    return off;
  };
