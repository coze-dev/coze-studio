/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef, useState } from 'react';

import { useEventCallback } from './use-event-callback';

type SearchStage = 'empty' | 'debouncing' | 'searching' | 'failed' | 'success';

export interface UseSearchConfig<Payload, Res> {
  debounceInterval: number;
  adjustDebounce?: (payload: Payload | null) => number;
  onError?: (e: unknown) => void;
  onSuccess?: (searchRes: Res, payload: Payload) => void;
}

// Todo adds test case on res reset
/** Beware of service reference changes! Once changed, a reload will be triggered */
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
    /** Note that null is set when emptying. */
    setPayload,
    searchStage,
    res,
    /** Mainly used for retrying */
    run: () => setTriggerId(c => c + 1),
  };
};
