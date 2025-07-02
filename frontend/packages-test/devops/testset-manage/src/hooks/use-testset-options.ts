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
