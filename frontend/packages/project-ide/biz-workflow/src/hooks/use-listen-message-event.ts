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

import { type RefObject } from 'react';

import { useMemoizedFn } from 'ahooks';
import { type WorkflowPlaygroundRef } from '@coze-workflow/playground';
import {
  useListenMessageEvent,
  type URI,
  type MessageEvent,
} from '@coze-project-ide/framework';

export const useListenWFMessageEvent = (
  uri: URI,
  ref: RefObject<WorkflowPlaygroundRef>,
) => {
  const listener = useMemoizedFn((e: MessageEvent) => {
    if (e.name === 'process' && e.data?.executeId && ref.current) {
      ref.current.getProcess({ executeId: e.data.executeId });
    } else if (e.name === 'debug' && ref.current) {
      const { nodeId, executeId, subExecuteId } = e?.data || {};
      if (nodeId) {
        setTimeout(() => {
          ref.current?.scrollToNode(nodeId);
        }, 1000);
      }
      if (executeId) {
        ref.current.showTestRunResult(executeId, subExecuteId);
      }
    }
  });

  useListenMessageEvent(uri, listener);
};
