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
 
import { I18n } from '@coze-arch/i18n';
import { MemoryApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { useVariableGroupsStore } from '../../store';
/**
 * 提交变量
 * @param projectID
 * @returns
 */
export async function submit(projectID: string) {
  const { getAllRootVariables, getDtoVariable } =
    useVariableGroupsStore.getState();
  const res = await MemoryApi.UpdateProjectVariable({
    ProjectID: projectID,
    VariableList: getAllRootVariables().map(item => getDtoVariable(item)),
  });

  if (res.code === 0) {
    Toast.success(I18n.t('Update_success'));
  }
}

/**
 * 检查并确保 projectID 是非空字符串
 * @param projectID 可能为空的项目ID
 * @returns projectID 是否为非空字符串
 */
export const checkProjectID = (projectID: unknown): projectID is string =>
  typeof projectID === 'string' && projectID.length > 0;
