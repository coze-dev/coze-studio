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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StandardNodeType, type WorkflowJSON } from '../../types';
import { type NodeResult } from '../../api';

export interface CaseResultData {
  dataList?: Array<{ title: string; data: any }>;
  imgList?: string[];
}

export interface NodeResultExtracted {
  nodeId?: string;
  nodeType?: StandardNodeType;
  isBatch?: boolean;
  caseResult?: CaseResultData[];
}
export type NodeResultExtractorParser = (
  nodeResult: NodeResult,
  workflowSchema: WorkflowJSON,
) => NodeResultExtracted;
