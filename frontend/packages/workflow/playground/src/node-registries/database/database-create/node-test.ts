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
