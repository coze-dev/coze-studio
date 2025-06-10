import { type ApiDetailData } from '@coze-arch/bot-api/workflow_api';

export const computeNodeVersion = (data: ApiDetailData) => {
  if (!data) {
    return {};
  }
  const isInProject = !!data.projectID;

  if (isInProject) {
    return {};
  }

  const {
    latest_version: latestVersionTs,
    latest_version_name: latestVersionName,
    version_name: versionName,
  } = data;

  return {
    latestVersionTs,
    latestVersionName,
    versionName,
  };
};
