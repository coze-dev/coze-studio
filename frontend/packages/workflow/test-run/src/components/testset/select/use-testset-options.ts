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

  // options 实时
  const optionsDataRef = useRef(optionsData);
  // options 缓存
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
