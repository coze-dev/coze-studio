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
 * commit variable
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
 * Check and make sure projectID is a non-empty string
 * @param projectID possibly empty project ID
 * @Returns whether projectID is a non-empty string
 */
export const checkProjectID = (projectID: unknown): projectID is string =>
  typeof projectID === 'string' && projectID.length > 0;
