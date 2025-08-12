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

import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowValidateError } from '@coze-workflow/base/services';
export type WorkflowProblem = WorkflowValidateError & {
  problems: {
    node: ProblemItem[];
    line: ProblemItem[];
  };
};

export interface ProblemItem {
  // error description
  errorInfo: string;
  // error level
  errorLevel: FeedbackStatus;
  // Error Type: Node/Connection
  errorType: 'node' | 'line';
  // Node ID
  nodeId: string;
  // In the case of a connection error, the target node is also required to confirm the connection
  targetNodeId?: string;
}
