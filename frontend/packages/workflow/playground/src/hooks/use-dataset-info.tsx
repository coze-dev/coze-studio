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
