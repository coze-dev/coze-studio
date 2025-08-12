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

import { useState } from 'react';

import { useMemoizedFn } from 'ahooks';
import { debuggerApi } from '@coze-arch/bot-api';

import { type TestsetData } from '../types';
import { useTestsetManageStore } from './use-testset-manage-store';

const DEFAULT_PAGE_SIZE = 30;

export interface OptionsData {
  list: TestsetData[];
  hasNext?: boolean;
  nextToken?: string;
}

export function useTestsetOptions() {
  const { bizComponentSubject, bizCtx } = useTestsetManageStore(store => store);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [optionsData, setOptionsData] = useState<OptionsData>({ list: [] });

  const updateOption = useMemoizedFn((testset?: TestsetData) => {
    if (!testset) {
      return;
    }

    const index = optionsData.list.findIndex(
      v => v.caseBase?.caseID === testset.caseBase?.caseID,
    );

    if (index > -1) {
      const newList = [...optionsData.list];
      newList[index] = testset;
      setOptionsData(prev => ({ ...prev, list: newList }));
    }
  });

  const loadOptions = useMemoizedFn(
    async (q?: string, limit = DEFAULT_PAGE_SIZE) => {
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
          pageLimit: limit,
        });
        setOptionsData({ list: cases, hasNext, nextToken });
        return cases;
      } finally {
        setLoading(false);
      }
    },
  );

  const loadMoreOptions = useMemoizedFn(
    async (q?: string, limit = DEFAULT_PAGE_SIZE) => {
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
          pageLimit: limit,
          nextToken: optionsData.nextToken,
        });
        setOptionsData(prev => ({
          list: [...prev.list, ...cases],
          hasNext,
          nextToken,
        }));
        return cases;
      } finally {
        setLoadingMore(false);
      }
    },
  );

  return {
    loading,
    loadOptions,
    loadingMore,
    loadMoreOptions,
    optionsData,
    updateOption,
  };
}
