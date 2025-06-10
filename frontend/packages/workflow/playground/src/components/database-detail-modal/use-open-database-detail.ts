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
