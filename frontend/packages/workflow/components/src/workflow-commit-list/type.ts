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

import {
  type VersionMetaInfo,
  type OperateType,
} from '@coze-workflow/base/api';

/** Process Submission History List Component */
export interface WorkflowCommitListProps {
  className?: string;
  spaceId: string;
  workflowId: string;
  /** operation type */
  type: OperateType;
  /** Read-only mode, read-only history cards cannot be clicked, does not affect action */
  readonly?: boolean;
  /** Number of pulls per page, default 10 */
  limit?: number;
  /** current selection */
  value?: string;
  /** Whether to display the current node */
  showCurrent?: boolean;
  /** Whether to support publishing to PPE function */
  enablePublishPPE?: boolean;
  /** Hide the commitId (the commitId is less readable, and non-professional users do not need to perceive it) */
  hideCommitId?: boolean;
  /** Card click */
  onItemClick?: (item: VersionMetaInfo) => void;
  /** Restore to a certain version Click */
  onResetToCommit?: (item: VersionMetaInfo) => void;
  /** To view a version click */
  onShowCommit?: (item: VersionMetaInfo) => void;
  /** Publish to Multi-environment Click */
  onPublishPPE?: (item: VersionMetaInfo) => void;
  /** Click [Now] */
  onCurrentClick?: (currentKey: string) => void;
}
