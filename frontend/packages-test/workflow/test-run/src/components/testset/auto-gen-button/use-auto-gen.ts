import { useCallback, useRef } from 'react';

import { debuggerApi } from '@coze-arch/bot-api';

import { useTestsetManageStore } from '../use-testset-manage-store';
import { typeSafeJSONParse } from '../../../utils';
import { type NodeFormSchema } from '../../../types';

export const useAutoGen = () => {
  const { bizCtx, bizComponentSubject, generating, patch } =
    useTestsetManageStore(store => ({
      bizCtx: store.bizCtx,
      bizComponentSubject: store.bizComponentSubject,
      generating: store.generating,
      patch: store.patch,
    }));
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    patch({ generating: true });
    try {
      abortRef.current = new AbortController();
      const { genCaseData } = await debuggerApi.AutoGenerateCaseData(
        { bizComponentSubject, bizCtx, count: 1 },
        { signal: abortRef.current.signal },
      );

      if (!genCaseData?.length) {
        return;
      }

      return (typeSafeJSONParse(genCaseData[0].input) ||
        []) as NodeFormSchema[];
    } finally {
      patch({ generating: false });
    }
  }, [bizCtx, bizComponentSubject, patch, abortRef]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, [abortRef]);

  return {
    generate,
    abort,
    generating,
  };
};
