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

import { useState, useRef } from 'react';

import axios, { type Canceler } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { workflowApi } from '@coze-workflow/base/api';
import { useUpdateEffect } from '@coze-arch/hooks';

import { useMergeConfirm } from '../workflow-header/hooks';
import { useGlobalState } from '../../hooks';

const LOOP_TIME = 10000;

export const useRetrieve = () => {
  const {
    workflowId,
    spaceId,
    info,
    loading,
    isViewHistory,
    isCollaboratorMode,
  } = useGlobalState();

  const { vcsData } = info;

  const { draft_commit_id, submit_commit_id } = vcsData || {};

  const [needMerge, setNeedMerge] = useState(false);

  const cancelReq = useRef<Canceler>();

  // TODO: Use 10-second intervals for rotations in this issue, and use long links instead in the second phase of requirements
  const { data: author } = useQuery({
    queryKey: ['workflow_retrieve', spaceId, workflowId],
    queryFn: async () => {
      const { data } = await workflowApi.CheckLatestSubmitVersion(
        {
          workflow_id: workflowId,
          space_id: spaceId,
        },
        {
          cancelToken: new axios.CancelToken(canceler => {
            cancelReq.current = canceler;
          }),
        },
      );

      const { need_merge, latest_submit_author } = data;
      setNeedMerge(!!need_merge);
      return latest_submit_author;
    },
    refetchInterval: LOOP_TIME,
    enabled: !loading && !!draft_commit_id && isCollaboratorMode && !needMerge,
  });

  useUpdateEffect(() => {
    setNeedMerge(false);
    cancelReq.current?.();
    // Base version changes, for example, after merging, you need to close the banner and re-rotate
  }, [submit_commit_id]);

  const { mergeConfirm } = useMergeConfirm();

  const handleRetrieve = async () => {
    await mergeConfirm();
  };

  return {
    showRetrieve: needMerge && isCollaboratorMode && !isViewHistory,
    author,
    handleRetrieve,
  };
};
