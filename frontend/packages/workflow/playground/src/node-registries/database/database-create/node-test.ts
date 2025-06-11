import { MemoryApi } from '@coze-arch/bot-api';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  async generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const databaseID = formData?.inputs?.databaseInfoList[0]?.databaseInfoID;
    if (!databaseID) {
      return {};
    }
    const db = await MemoryApi.GetDatabaseByID({
      id: databaseID,
      need_sys_fields: true,
    });
    const fieldInfo = formData?.inputs?.insertParam?.fieldInfo ?? [];

    const parameters = fieldInfo.map(item => {
      const databaseField = db?.database_info?.field_list?.find(
        field => field.alterId === item.fieldID,
      );
      return {
        name: `__setting_field_${item?.fieldID}`,
        title: databaseField?.name,
        input: item?.fieldValue,
      };
    });

    return generateParametersToProperties(parameters, { node });
  },
};
