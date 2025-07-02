import { useEffect, useRef, useState } from 'react';

import { useEventCallback } from './use-event-callback';

type SearchStage = 'empty' | 'debouncing' | 'searching' | 'failed' | 'success';

export interface UseSearchConfig<Payload, Res> {
  debounceInterval: number;
  adjustDebounce?: (payload: Payload | null) => number;
  onError?: (e: unknown) => void;
  onSuccess?: (searchRes: Res, payload: Payload) => void;
}

// todo 补充关于 res 重置的测试 case
/** 小心 service 引用变化! 一旦变化会触发重新加载 */
export const useSearch = <Payload, Res>(
  service: (payload: Payload) => Promise<Res>,
  {
    onError,
    debounceInterval,
    adjustDebounce,
    onSuccess,
  }: UseSearchConfig<Payload, Res>,
) => {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [searchStage, setSearchStage] = useState<SearchStage>('empty');
  const [res, setRes] = useState<Res | null>(null);
  const [triggerId, setTriggerId] = useState(0);
  const debounceIdRef = useRef<ReturnType<typeof setTimeout>>();

  const isEmpty = (localPayload: Payload | null): localPayload is null =>
    localPayload === null;

  const doSearch = useEventCallback(() => {
    clearTimeout(debounceIdRef.current);
    const finalDebounceTime = adjustDebounce?.(payload) ?? debounceInterval;
    debounceIdRef.current = setTimeout(async () => {
      setRes(null);
      const searchCount = debounceIdRef.current;
      if (isEmpty(payload)) {
        setSearchStage('empty');
        return;
      }
      setSearchStage('searching');
      try {
        const searchRes = await service(payload);
        if (searchCount !== debounceIdRef.current) {
          return;
        }
        setRes(searchRes);
        setSearchStage('success');
        onSuccess?.(searchRes, payload);
      } catch (e) {
        if (searchCount !== debounceIdRef.current) {
          return;
        }
        console.error('[doSearch in use-search]', e);
        onError?.(e);
        setSearchStage('failed');
      }
    }, finalDebounceTime);
  });

  useEffect(() => {
    setRes(null);
    if (isEmpty(payload)) {
      setSearchStage('empty');
    } else {
      setSearchStage('debouncing');
    }
    doSearch();
  }, [payload, service, triggerId]);
  return {
    /** 注意清空时设置为 null */
    setPayload,
    searchStage,
    res,
    /** 主要用于重试 */
    run: () => setTriggerId(c => c + 1),
  };
};
