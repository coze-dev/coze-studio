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

import { createContext, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  workflowApi,
  type DiffContent,
  type DiffContentMeta,
} from '@coze-workflow/base/api';
import { withQueryClient } from '@coze-workflow/base';

import {
  DiffItems,
  DIFF_ITEM_NAMES,
  type RetainedResult,
} from '../../constants';
import { Retained } from '../../constants';

export interface DiffItemData {
  key: string;
  property: string;
  lastVersion: DiffContentMeta | undefined;
  myDraft: DiffContentMeta | undefined;
  isConflict: boolean;
}

interface MergeProviderProps {
  spaceId: string;
  workflowId: string;
  children: React.ReactNode;
}

const transformMergeDiff = (
  submitDiff?: DiffContent,
  draftDiff?: DiffContent,
) =>
  Object.values(DiffItems)
    .map(key => ({
      key,
      property: DIFF_ITEM_NAMES[key],
      lastVersion: submitDiff?.[key],
      myDraft: draftDiff?.[key],
      // Both are modified as conflicts
      isConflict: !!(submitDiff?.[key]?.modify && draftDiff?.[key]?.modify),
      // At least one of the two has been modified before the diff is displayed.
      hasDiff: !!(submitDiff?.[key]?.modify || draftDiff?.[key]?.modify),
    }))
    .filter(item => item.hasDiff);

export const MergeContext = createContext<{
  workflowId: string;
  spaceId: string;
  loading: boolean;
  mergeable: boolean;
  hasConflict: boolean;
  submitDiff?: DiffContent;
  draftDiff?: DiffContent;
  data: Array<DiffItemData>;
  retainedResult: RetainedResult;
  handleRetained: (result: Record<string, string>) => void;
}>({
  workflowId: '',
  spaceId: '',
  loading: false,
  mergeable: false,
  hasConflict: false,
  data: [],
  retainedResult: {},
  handleRetained: result => null,
});

export const MergeProvider = withQueryClient(
  ({ children, spaceId, workflowId }: MergeProviderProps) => {
    const [retainedResult, setRetainedResult] = useState<RetainedResult>({
      [DiffItems.Schema]: Retained.Draft,
    });

    const handleRetained = result => {
      setRetainedResult({
        ...retainedResult,
        ...result,
      });
    };

    const { isLoading, data: mergeDiff } = useQuery({
      queryKey: ['workflow_merge', spaceId, workflowId],
      queryFn: async () => {
        const { data } = await workflowApi.GetConflictFromContent({
          space_id: spaceId,
          workflow_id: workflowId,
        });
        return data;
      },
    });

    const { submit_diff: submitDiff, draft_diff: draftDiff } = mergeDiff || {};

    const data: Array<DiffItemData> = transformMergeDiff(submitDiff, draftDiff);

    const hasConflict = !!data.some(item => item.isConflict);

    const mergeable = true;

    return (
      <MergeContext.Provider
        value={{
          workflowId,
          spaceId,
          loading: isLoading,
          submitDiff,
          draftDiff,
          data,
          hasConflict,
          mergeable,
          retainedResult,
          handleRetained,
        }}
      >
        {children}
      </MergeContext.Provider>
    );
  },
);
