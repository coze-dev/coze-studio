import { I18n } from '@coze-arch/i18n';
import { intelligenceApi } from '@coze-arch/bot-api';

export async function checkVersionNum(
  versionNumber: string,
  projectId: string,
) {
  if (!versionNumber) {
    return I18n.t('project_release_example2');
  }
  const { data } = await intelligenceApi.CheckProjectVersionNumber({
    project_id: projectId,
    version_number: versionNumber,
  });

  if (data?.is_duplicate) {
    return I18n.t('project_release_example3');
  } else {
    return '';
  }
}
