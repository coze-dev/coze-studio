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

import { reporter } from '@coze-arch/logger';

const timerMap: Record<string, { timer?: NodeJS.Timeout; start: number }> = {};

export function moveTimeConsuming(
  workflowId: string,
  nodeId: string,
  wait = 100,
) {
  const key = `${workflowId}&&${nodeId}`;
  if (timerMap[key]) {
    clearTimeout(timerMap[key].timer);
  } else {
    timerMap[key] = {
      timer: undefined,
      start: Date.now(),
    };
  }
  timerMap[key].timer = setTimeout(() => {
    reporter.event({
      eventName: 'workflow_node_drag_consuming',
      namespace: 'workflow',
      scope: 'node',
      meta: {
        workflowId,
        nodeId,
        time: Date.now() - timerMap[key].start,
      },
    });
    delete timerMap[key];
  }, wait);
}
