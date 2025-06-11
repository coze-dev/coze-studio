import {
  type LimitGlobalInitSelector,
  type SubscriptionSelector,
} from '../../types/plugin-class/selector';
import { type GlobalInitStore } from '../../../store/global-init';

export const createSubscribeGlobalInitState: SubscriptionSelector<
  LimitGlobalInitSelector,
  GlobalInitStore
> =
  (store, usePluginStore) =>
  ({ selector, listener, options }) => {
    const off = store.subscribe(selector, listener, options);
    usePluginStore.getState().appendServiceOffSubscriptionList(off);
    return off;
  };
