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

import { useContext } from 'react';

import { workflowApi } from '@coze-workflow/base';
import { reporter } from '@coze-arch/logger';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';

import { DiffItems, MERGE_KEY_MAP } from '../../constants';
import { MergeContext } from './merge-context';

export const useMerge = () => {
  const context = useContext(MergeContext);

  const handleMerge = async (): Promise<boolean> => {
    try {
      const { workflowId, spaceId, retainedResult, submitDiff, draftDiff } =
        context;

      sendTeaEvent(EVENT_NAMES.workflow_merge, {
        workflow_id: workflowId,
        workspace_id: spaceId,
        merge_type: retainedResult[DiffItems.Schema] || '',
      });

      const mergeResults = Object.values(DiffItems).reduce((result, key) => {
        let mergeResult;
        // No conflict, choose the latest
        if (!retainedResult[key]) {
          if (submitDiff?.[key]?.modify) {
            mergeResult = submitDiff?.[key]?.after;
          } else {
            mergeResult = draftDiff?.[key]?.after;
          }
        } else {
          // If there is a conflict, choose the corresponding one.
          if (retainedResult[key] === 'submit') {
            mergeResult = submitDiff?.[key]?.after;
          } else {
            mergeResult = draftDiff?.[key]?.after;
          }
        }

        return {
          ...result,
          [MERGE_KEY_MAP[key]]: mergeResult,
        };
      }, {});

      await workflowApi.MergeWorkflow({
        workflow_id: workflowId,
        space_id: spaceId,
        submit_commit_id: submitDiff?.name_dif?.after_commit_id || '',
        ...mergeResults,
      });
      reporter.successEvent({
        eventName: 'workflow_merge_success',
        namespace: 'workflow',
      });
      return true;
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_merge_fail',
        namespace: 'workflow',
        error,
      });
      return false;
    }
  };

  return { ...context, handleMerge };
};
