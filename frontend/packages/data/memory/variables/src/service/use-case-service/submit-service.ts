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
