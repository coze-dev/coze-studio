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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { reporter } from '@coze-arch/logger';
import { type WorkflowGrayFeatureItem } from '@coze-arch/bot-api/developer_api';
import { workflowApi } from '@coze-arch/bot-api';

export enum TccKey {
  ImageGenerateConverter = 'ImageGenerateConverter',
}

interface TccStore {
  spaceId: string;
  grayFeatureItems: Array<WorkflowGrayFeatureItem>;
}

interface TccAction {
  load: (spaceId: string) => Promise<void>;
  isHitSpaceGray: (key: TccKey) => boolean;
}

const initialStore: TccStore = {
  spaceId: '',
  grayFeatureItems: [],
};

const fetchTccConfig = async spaceId => {
  try {
    const getWorkflowGrayFeature = IS_BOT_OP
      ? workflowApi.OPGetWorkflowGrayFeature.bind(workflowApi)
      : workflowApi.GetWorkflowGrayFeature.bind(workflowApi);
    const { data } = await getWorkflowGrayFeature({
      space_id: spaceId,
    });
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    reporter.error({
      message: 'workflow_prefetch_tcc_fail',
      namespace: 'workflow',
      error,
    });
  }
};

/* Dynamically configured grey release of space granularity via tcc */
export const useSpaceGrayStore = create<TccStore & TccAction>()(
  devtools(
    (set, get) => ({
      ...initialStore,
      load: async spaceId => {
        const { spaceId: cachedSpaceId } = get();
        if (spaceId !== cachedSpaceId) {
          const data = await fetchTccConfig(spaceId);
          set({ grayFeatureItems: data, spaceId });
        }
      },
      isHitSpaceGray: key => {
        const { grayFeatureItems } = get();
        return !!(grayFeatureItems || []).find(item => item.feature === key)
          ?.in_gray;
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.TccStore',
    },
  ),
);
