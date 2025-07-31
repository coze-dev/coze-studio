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

import { useMemo, useState } from 'react';

import { WorkflowExecStatus } from '@coze-workflow/base';
import { useEntity } from '@flowgram-adapter/free-layout-editor';

import {
  WorkflowGlobalStateEntity,
  WorkflowTestFormStateEntity,
} from '../../../entities';

const useTestRunStatus = (nodeId: string) => {
  const globalState = useEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
  );
  const testFormState = useEntity<WorkflowTestFormStateEntity>(
    WorkflowTestFormStateEntity,
  );
  const [loading, setLoading] = useState(false);
  const {
    config: { saving, saveLoading, viewStatus },
  } = globalState;
  const {
    config: { frozen },
  } = testFormState;

  const disabled = useMemo(
    () => !loading && (!!frozen || saving),
    [loading, frozen, saving],
  );

  /** Is it a lock triggered by this node? */
  const isMineRunning = useMemo(
    () => frozen && frozen === nodeId,
    [frozen, nodeId],
  );

  const running = useMemo(
    () => viewStatus === WorkflowExecStatus.EXECUTING,
    [viewStatus],
  );

  return {
    loading,
    setLoading,
    saving,
    saveLoading,
    frozen,
    disabled,
    isMineRunning,
    running,
  };
};

export { useTestRunStatus };
