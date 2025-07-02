import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import {
  transformUnitList,
  getFileExtension,
  getBase64,
} from '@coze-data/knowledge-resource-processor-base';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

export const useRetry = (params: {
  unitList: UnitItem[];
  setUnitList: (unitList: UnitItem[]) => void;
}) => {
  const { unitList, setUnitList } = params;

  const onRetry = async (record: UnitItem, index: number) => {
    try {
      const { fileInstance } = record;
      if (fileInstance) {
        const { name } = fileInstance;
        const extension = getFileExtension(name);
        const base64 = await getBase64(fileInstance);
        const result = await DeveloperApi.UploadFile({
          file_head: {
            file_type: extension,
            biz_type: FileBizType.BIZ_BOT_DATASET,
          },
          data: base64,
        });

        setUnitList(
          transformUnitList({
            unitList,
            data: result?.data,
            fileInstance,
            index,
          }),
        );
      }
    } catch (e) {
      const error = e as Error;
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: REPORT_EVENTS.KnowledgeUploadFile,
        error,
      });
    }
  };
  return onRetry;
};
