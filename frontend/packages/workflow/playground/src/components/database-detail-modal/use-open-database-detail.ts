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

import { set, get } from 'lodash-es';
import { useWorkflowNode, StandardNodeType } from '@coze-workflow/base';

import { useWorkflowDetailModalStore } from './use-workflow-detail-modal-store';
import { type DatabaseDetailTab } from './types';

interface OpenDatabaseDetailProps {
  databaseID?: string;
}

export function useOpenDatabaseDetail() {
  const { open } = useWorkflowDetailModalStore();
  const { setData, data, type } = useWorkflowNode();

  const tab: DatabaseDetailTab = 'draft';

  function onChangeDatabaseToWorkflow(databaseID?: string) {
    const databaseInfoList = databaseID
      ? [
          {
            databaseInfoID: databaseID,
          },
        ]
      : [];

    const dataCopy = { ...data };

    if (type === StandardNodeType.Database) {
      set(dataCopy, 'databaseInfoList', databaseInfoList);
    } else {
      set(dataCopy, 'inputs.databaseInfoList', databaseInfoList);
    }

    setData(dataCopy);
  }

  return {
    openDatabaseDetail: ({ databaseID }: OpenDatabaseDetailProps = {}) => {
      const databaseInfoList =
        get(data, 'databaseInfoList') || get(data, 'inputs.databaseInfoList');

      const currentNodeDatabaseID = databaseInfoList?.[0]
        ?.databaseInfoID as string;

      if (databaseID === undefined) {
        databaseID = currentNodeDatabaseID;
      }

      open({
        databaseID,
        isAddedInWorkflow: databaseID === currentNodeDatabaseID,
        onChangeDatabaseToWorkflow,
        tab,
      });
    },
  };
}
