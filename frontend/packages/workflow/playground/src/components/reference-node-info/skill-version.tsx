import React, { useMemo } from 'react';

import semver from 'semver';
import { toString } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { useNodeVersionService } from '@/hooks/node-version';
import { useGlobalState } from '@/hooks';

import { checkUpdateVersionModel } from './check-update-version-model';
import { BaseVersionInfo, OutDatedVersionInfo } from './base-version';

interface ApiSkillVersionProps {
  versionName?: string;
  versionTs?: string;
  latestVersionName?: string;
  latestVersionTs?: string | number;
  pluginId?: string;
}

export const ApiSkillVersion: React.FC<ApiSkillVersionProps> = ({
  versionName,
  latestVersionName,
  versionTs,
  latestVersionTs: originLatestVersionTs,
  pluginId,
}) => {
  const nodeVersionService = useNodeVersionService();
  const globalState = useGlobalState();
  const latestVersionTs = toString(originLatestVersionTs);
  const hasVersion = Boolean(
    pluginId &&
      versionTs &&
      latestVersionTs &&
      versionTs !== '0' &&
      latestVersionTs !== '0',
  );

  const isOutdated = useMemo(
    () => hasVersion && latestVersionTs !== versionTs,
    [versionTs, latestVersionTs, hasVersion],
  );

  const handleUpdate = async () => {
    const confirm = await checkUpdateVersionModel(
      I18n.t('workflow_version_update_model_content', {
        myVersion: versionName,
        latestVersion: latestVersionName,
      }),
    );
    if (confirm && pluginId && latestVersionTs) {
      await nodeVersionService.updateApiNodesVersion(pluginId, latestVersionTs);
    }
  };

  if (!hasVersion) {
    return null;
  }

  return isOutdated && !globalState.readonly ? (
    <OutDatedVersionInfo versionName={versionName} onUpdate={handleUpdate} />
  ) : (
    <BaseVersionInfo versionName={versionName} />
  );
};

interface SubWorkflowSkillVersionProps {
  versionName?: string;
  latestVersionName?: string;
  workflowId?: string;
}

export const SubWorkflowSkillVersion: React.FC<
  SubWorkflowSkillVersionProps
> = ({ versionName, latestVersionName, workflowId }) => {
  const nodeVersionService = useNodeVersionService();
  const globalState = useGlobalState();
  const hasVersion = Boolean(
    workflowId &&
      versionName &&
      latestVersionName &&
      semver.valid(latestVersionName) &&
      semver.valid(versionName),
  );

  const isOutdated = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => hasVersion && semver.lt(versionName!, latestVersionName!),
    [versionName, latestVersionName, hasVersion],
  );

  const handleUpdate = async () => {
    const confirm = await checkUpdateVersionModel(
      I18n.t('workflow_version_update_model_content', {
        myVersion: versionName,
        latestVersion: latestVersionName,
      }),
    );
    if (confirm && workflowId && latestVersionName) {
      await nodeVersionService.updateSubWorkflowNodesVersion(
        workflowId,
        latestVersionName,
      );
    }
  };

  if (!hasVersion) {
    return null;
  }

  return isOutdated && !globalState.readonly ? (
    <OutDatedVersionInfo versionName={versionName} onUpdate={handleUpdate} />
  ) : (
    <BaseVersionInfo versionName={versionName} />
  );
};
