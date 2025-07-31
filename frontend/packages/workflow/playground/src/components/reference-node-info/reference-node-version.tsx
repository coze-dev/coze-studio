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

import React, { useEffect, useMemo, useState } from 'react';

import semver from 'semver';
import { I18n } from '@coze-arch/i18n';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import {
  getMySubWorkflowNodeVersion,
  getSubWorkflowNode,
  getApiNodeVersion,
  getMyApiNodeVersion,
} from '@/services/node-version-service';
import { useNodeVersionService } from '@/hooks/node-version';
import { useDependencyService, useGlobalState } from '@/hooks';

import { useNodeOrigin } from './use-node-origin';
import { checkUpdateVersionModel } from './check-update-version-model';
import { BaseVersionInfo, OutDatedVersionInfo } from './base-version';

interface VersionInfoProps {
  node: FlowNodeEntity;
  /** explicit version number */
  versionName?: string;
  latestVersionName?: string;
  latestVersionTs?: string;
  /** Is it already behind? */
  isOutdated: boolean;
}
const VersionInfo: React.FC<VersionInfoProps> = ({
  node,
  versionName,
  latestVersionName,
  latestVersionTs,
  isOutdated,
}) => {
  const nodeVersionService = useNodeVersionService();
  const globalState = useGlobalState();
  const handleUpdateVersion = async () => {
    const confirm = await checkUpdateVersionModel(
      I18n.t('workflow_version_update_model_content', {
        myVersion: versionName,
        latestVersion: latestVersionName || latestVersionTs,
      }),
    );
    if (confirm && latestVersionTs) {
      await nodeVersionService.updateNodesVersion(node, latestVersionTs);
    }
  };

  if (isOutdated && !globalState.readonly) {
    return (
      <OutDatedVersionInfo
        versionName={versionName}
        onUpdate={handleUpdateVersion}
      />
    );
  }

  return <BaseVersionInfo versionName={versionName} />;
};

interface ReferenceNodeVersionProps {
  node: FlowNodeEntity;
}

const SubWorkflowVersion: React.FC<ReferenceNodeVersionProps> = ({ node }) => {
  const myVersion = getMySubWorkflowNodeVersion(node);
  const nodeData = getSubWorkflowNode(node);
  const [latestVersion, setLatestVersion] = useState<string>(
    nodeData?.latestVersion ?? '',
  );
  const dependencyService = useDependencyService();

  useEffect(() => {
    const disposable = dependencyService.onSubWrokflowVersionChange(props => {
      if (props?.subWorkflowId !== nodeData?.workflow_id) {
        return;
      }
      const curNodeData = getSubWorkflowNode(node);
      setLatestVersion(curNodeData?.latestVersion ?? '');
    });

    return () => {
      disposable?.dispose?.();
    };
  }, [node]);

  const hasVersion = Boolean(
    latestVersion &&
      myVersion &&
      semver.valid(latestVersion) &&
      semver.valid(myVersion),
  );

  const isOutdated = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => hasVersion && semver.lt(myVersion!, latestVersion!),
    [latestVersion, myVersion, hasVersion],
  );

  if (!hasVersion) {
    return null;
  }

  return (
    <VersionInfo
      node={node}
      versionName={myVersion}
      latestVersionTs={latestVersion}
      latestVersionName={latestVersion}
      isOutdated={isOutdated}
    />
  );
};

const ApiVersion: React.FC<ReferenceNodeVersionProps> = ({ node }) => {
  const myVersionTs = getMyApiNodeVersion(node);
  const {
    versionName: myVersionName,
    latestVersionTs,
    latestVersionName,
  } = getApiNodeVersion(node);

  const hasVersion = Boolean(
    latestVersionTs &&
      myVersionTs &&
      myVersionTs !== '0' &&
      latestVersionTs !== '0',
  );

  const isOutdated = useMemo(
    () => hasVersion && latestVersionTs !== myVersionTs,
    [hasVersion, latestVersionTs, myVersionTs],
  );

  if (!hasVersion) {
    return null;
  }

  return (
    <VersionInfo
      node={node}
      versionName={myVersionName || myVersionTs}
      latestVersionTs={latestVersionTs}
      latestVersionName={latestVersionName}
      isOutdated={isOutdated}
    />
  );
};

export const ReferenceNodeVersion: React.FC<ReferenceNodeVersionProps> = ({
  node,
}) => {
  const { isFromLibrary, isApi } = useNodeOrigin(node);

  if (!isFromLibrary) {
    return null;
  }

  return isApi ? (
    <ApiVersion node={node} />
  ) : (
    <SubWorkflowVersion node={node} />
  );
};
