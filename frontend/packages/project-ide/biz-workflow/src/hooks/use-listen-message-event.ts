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
