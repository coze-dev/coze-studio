import { useState, useEffect, useCallback, useRef } from 'react';

import { MessageBizType } from '@coze-arch/idl/workflow_api';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { type Disposable } from '@flowgram-adapter/common';

import { useGlobalState } from './use-global-state';
import { useDependencyService } from './use-dependency-service';

export const useDataSetInfos = ({ ids }: { ids: string[] }) => {
  const [dataSets, setDataSets] = useState<Dataset[]>([]);
  const [isReady, setReady] = useState(false);
  const { spaceId, sharedDataSetStore } = useGlobalState();
  const dependencyService = useDependencyService();

  const disposeRef: React.MutableRefObject<Disposable | null> =
    useRef<Disposable>(null);

  const getDataSetInfos = useCallback(
    async (_ids: string[]) => {
      try {
        const _dataSets = await sharedDataSetStore.getDataSetInfosByIds(
          _ids,
          spaceId,
        );
        setDataSets(_dataSets);
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
      }
    },
    [spaceId],
  );

  useEffect(() => {
    getDataSetInfos(ids);
    if (!disposeRef.current) {
      disposeRef.current = dependencyService.onDependencyChange(source => {
        if (source?.bizType === MessageBizType.Dataset) {
          getDataSetInfos(ids);
        }
      });
    }

    return () => {
      disposeRef?.current?.dispose?.();
      disposeRef.current = null;
    };
  }, [ids.join('')]);

  return {
    dataSets,
    isReady,
    cacheDataSetInfo: sharedDataSetStore.addDataSetInfo,
  };
};
