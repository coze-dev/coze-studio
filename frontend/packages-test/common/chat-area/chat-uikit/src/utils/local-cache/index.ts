import { isObject } from 'lodash-es';
import { type Reporter } from '@coze-arch/logger';

import { UiKitReportEvents } from '../report-event';
import { type StoreStruct } from './type';

const PERSIST_CACHE_KEY = 'cache:@coze-common/chat-area';

const cachedReadWholeStore = (() => {
  let cached: Partial<StoreStruct> | null;
  return (reporter: Reporter) => {
    if (!cached) {
      cached = readFromCache(reporter);
    }
    return cached;
  };
})();

const getPlaceholderStruct = (): Partial<StoreStruct> => ({});

export type ReadLocalStoreValue = <K extends keyof StoreStruct>(
  name: K,
  fallbackValue: StoreStruct[K],
) => StoreStruct[K];
export type WriteLocalStoreValue = <K extends keyof StoreStruct>(
  name: K,
  value: StoreStruct[K],
) => void;

export const getReadLocalStoreValue =
  (reporter: Reporter): ReadLocalStoreValue =>
  (name, fallbackValue) => {
    const readStruct = cachedReadWholeStore(reporter);
    if (!readStruct) {
      return fallbackValue;
    }
    return readStruct[name] ?? fallbackValue;
  };

export const getWriteLocalStoreValue =
  (reporter: Reporter): WriteLocalStoreValue =>
  (name, value) => {
    const readStruct = cachedReadWholeStore(reporter);
    const writeStruct = readStruct || getPlaceholderStruct();
    writeStruct[name] = value;
    saveToCache(reporter, writeStruct);
  };

const readFromCache = (reporter: Reporter): Partial<StoreStruct> | null => {
  try {
    const content = window.localStorage.getItem(PERSIST_CACHE_KEY);
    if (!content) {
      return null;
    }
    const res = JSON.parse(content);
    if (isObject(res)) {
      return res as StoreStruct;
    }
    return null;
  } catch (e) {
    reporter.errorEvent({
      eventName: UiKitReportEvents.FailReadLocalStorage,
      error: e,
    });
    return null;
  }
};

const saveToCache = (reporter: Reporter, struct: Partial<StoreStruct>) => {
  try {
    if (isObject(struct)) {
      const content = JSON.stringify(struct);
      window.localStorage.setItem(PERSIST_CACHE_KEY, content);
    }
  } catch (e) {
    reporter.errorEvent({
      eventName: UiKitReportEvents.FailWriteLocalStorage,
      error: e,
    });
  }
};
