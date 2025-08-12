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

import { useState, useCallback, useRef } from 'react';

import {
  type CaseDataDetail,
  type Int64,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import { useTestsetManageStore } from '../use-testset-manage-store';
import { TESTSET_PAGE_SIZE } from '../../../constants';

export interface OptionsData {
  list: CaseDataDetail[];
  hasNext?: boolean;
  nextToken?: string;
}

export function useTestsetOptions() {
  const { bizComponentSubject, bizCtx } = useTestsetManageStore(store => store);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [optionsData, setOptionsData] = useState<OptionsData>({ list: [] });

  // Options in real time
  const optionsDataRef = useRef(optionsData);
  // Options cache
  const optionsCacheRef = useRef(new Map<Int64, CaseDataDetail>());

  const setOptionsDataWithCache = useCallback(
    (val: OptionsData) => {
      setOptionsData(val);
      optionsDataRef.current = val;
      if (val.list.length) {
        val.list.forEach(v => {
          if (v.caseBase?.caseID) {
            optionsCacheRef.current.set(v.caseBase.caseID, v);
          }
        });
      }
    },
    [setOptionsData, optionsDataRef, optionsCacheRef],
  );

  const updateOption = useCallback(
    (testset?: CaseDataDetail) => {
      if (!testset) {
        return;
      }

      const index = optionsDataRef.current.list.findIndex(
        v => v.caseBase?.caseID === testset.caseBase?.caseID,
      );

      if (index > -1) {
        const newList = [...optionsData.list];
        newList[index] = testset;
        setOptionsDataWithCache({ ...optionsDataRef.current, list: newList });
      }
    },
    [setOptionsDataWithCache],
  );

  const loadOptions = useCallback(
    async (q?: string) => {
      setLoading(true);
      try {
        const {
          cases = [],
          hasNext,
          nextToken,
        } = await debuggerApi.MGetCaseData({
          bizCtx,
          bizComponentSubject,
          caseName: q,
          pageLimit: TESTSET_PAGE_SIZE,
        });
        setOptionsDataWithCache({ list: cases, hasNext, nextToken });
        return cases;
      } finally {
        setLoading(false);
      }
    },
    [bizComponentSubject, bizCtx, setOptionsDataWithCache],
  );

  const loadMoreOptions = useCallback(
    async (q?: string) => {
      setLoadingMore(true);
      try {
        const {
          cases = [],
          hasNext,
          nextToken,
        } = await debuggerApi.MGetCaseData({
          bizCtx,
          bizComponentSubject,
          caseName: q,
          pageLimit: TESTSET_PAGE_SIZE,
          nextToken: optionsDataRef.current.nextToken,
        });
        setOptionsDataWithCache({
          list: [...optionsDataRef.current.list, ...cases],
          hasNext,
          nextToken,
        });
        return cases;
      } finally {
        setLoadingMore(false);
      }
    },
    [bizComponentSubject, bizCtx, optionsDataRef, setOptionsDataWithCache],
  );

  return {
    loading,
    loadOptions,
    loadingMore,
    loadMoreOptions,
    optionsData,
    updateOption,
    optionsCacheRef,
    optionsDataRef,
  };
}
