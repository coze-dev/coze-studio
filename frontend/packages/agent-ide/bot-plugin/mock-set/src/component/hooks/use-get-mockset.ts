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

import { useEffect, useRef } from 'react';

import { nanoid } from 'nanoid';
import axios, { type Canceler } from 'axios';
import { logger } from '@coze-arch/logger';
import {
  type BizCtx,
  type MockSet,
  type MockSetBinding,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import { MockTrafficEnabled } from '../../util/get-mock-set-options';
import { isSameScene } from '../../util';
import { type EnabledMockSetInfo, useMockInfoStore } from './store';

function combineBindMockSetInfo(
  mockSetBindingList: Array<MockSetBinding>,
  mockSetDetailSet: Record<string, MockSet>,
): Array<EnabledMockSetInfo> {
  return mockSetBindingList.map(mockSetInfo => {
    const { mockSetID } = mockSetInfo;
    const detail = mockSetID ? mockSetDetailSet[mockSetID] : {};
    return {
      mockSetBinding: mockSetInfo,
      mockSetDetail: detail,
    };
  });
}

// eslint-disable-next-line max-lines-per-function
export const useInitialGetEnabledMockSet = ({
  bizCtx,
  pollingInterval,
}: {
  bizCtx: BizCtx;
  pollingInterval?: number;
}) => {
  const {
    enabledMockSetInfo,
    setPolling,
    setEnabledMockSetInfo,
    bizCtx: currentBizCtx,
    setCurrentBizCtx,
    addMockComp,
    removeMockComp,
    isPolling,
    setTimer,
    timer,
    currentMockComp,
    setLoading,
    isLoading,
    restartTimer,
    setRestartTimer,
  } = useMockInfoStore();
  const status = useRef<boolean>(false);
  const lastRequestId = useRef(0);
  const pollingTurnRef = useRef<string>();

  const cancelReq = useRef<Canceler>();

  const requestFn = async (curBizCtx: BizCtx) => {
    const currentRequestId = ++lastRequestId.current;
    const currentPollingTurn = pollingTurnRef.current;
    try {
      const { mockSetBindings = [], mockSetDetails = {} } =
        await debuggerApi.MGetMockSetBinding(
          {
            bizCtx: curBizCtx,
            needMockSetDetail: true,
          },
          {
            headers: {
              'rpc-persist-mock-traffic-enable': MockTrafficEnabled.ENABLE,
            },
            cancelToken: new axios.CancelToken(function executor(c) {
              cancelReq.current = c;
            }),
          },
        );

      if (
        (currentRequestId > 1 && currentRequestId !== lastRequestId.current) ||
        !pollingTurnRef.current ||
        pollingTurnRef.current !== currentPollingTurn
      ) {
        return;
      }
      setEnabledMockSetInfo?.(
        combineBindMockSetInfo(mockSetBindings, mockSetDetails),
      );
      return { mockSetBindings, mockSetDetails };
    } catch (e) {
      if (axios.isCancel(e)) {
        logger.info('poll_scene_mockset_canceled');
      } else {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error: e, eventName: 'poll_scene_mockset_fail' });
      }
    }
  };

  const request = async () => {
    try {
      const {
        trafficCallerID,
        connectorID,
        connectorUID,
        bizSpaceID,
        trafficScene,
      } = bizCtx;
      !status.current && (status.current = true);
      setLoading(true);
      if (status.current && pollingInterval) {
        setPolling(true);
        const id = setTimeout(() => {
          status.current && request();
        }, pollingInterval);
        setTimer(id);
      }
      await requestFn({
        trafficCallerID,
        connectorID,
        connectorUID,
        bizSpaceID,
        trafficScene,
      });
    } finally {
      setLoading(false);
    }
  };

  // cancel
  const cancel = () => {
    pollingTurnRef.current = undefined;
    cancelReq.current?.();
    lastRequestId.current = 0;
    cancelRestartTask();

    if (timer) {
      clearTimeout(timer);
      setPolling(false);
      setTimer(undefined);
      status.current && (status.current = false);
    }
  };

  const cancelRestartTask = () => {
    if (restartTimer) {
      clearTimeout(restartTimer);
      setRestartTimer(undefined);
    }
  };

  const start = async () => {
    cancel();
    pollingTurnRef.current = nanoid();
    await request();
  };

  useEffect(() => {
    if (currentBizCtx && isSameScene(bizCtx, currentBizCtx)) {
      return;
    }
    setCurrentBizCtx(bizCtx);
  }, [bizCtx]);

  return {
    start,
    cancel,
    isLoading,
    data: enabledMockSetInfo,
    addMockComp,
    removeMockComp,
    currentMockComp,
    isPolling,
    setRestartTimer,
    restartTimer,
  };
};
