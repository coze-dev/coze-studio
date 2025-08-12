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

import React, { useMemo } from 'react';

import {
  useProjectId,
  useSpaceId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import { useWorkflowResource } from '@coze-project-ide/biz-workflow';
import { usePluginResource } from '@coze-project-ide/biz-plugin';
import { useDataResource } from '@coze-project-ide/biz-data';
import {
  BizResourceTypeEnum,
  ProjectResourceGroupType,
  ResourceFolderCoze,
  useResourceList,
  VARIABLE_RESOURCE_ID,
} from '@coze-project-ide/biz-components';
import {
  EProjectPermission,
  useProjectAuth,
  useProjectRole,
} from '@coze-common/auth';
import { FormatType } from '@coze-arch/bot-api/knowledge';
import {
  IconCozDatabase,
  IconCozDocument,
  IconCozImage,
  IconCozPlugin,
  IconCozTable,
  IconCozVariables,
} from '@coze-arch/coze-design/icons';

const datasetIconMap = {
  [FormatType.Text]: <IconCozDocument />,
  [FormatType.Table]: <IconCozTable />,
  [FormatType.Image]: <IconCozImage />,
};

export const ResourceList = ({
  idPrefix = 'fixed-sidebar',
}: {
  idPrefix?: string;
}) => {
  const {
    onCustomCreate: createWorkflow,
    onDelete: deleteWorkflow,
    onChangeName: changeNameWorkflow,
    onAction: handleWorkflowAction,
    createResourceConfig: workflowCreateConfig,
    iconRender: workflowIconRender,
    modals: workflowModals,
  } = useWorkflowResource();

  const {
    onCustomCreate: createPlugin,
    onDelete: deletePlugin,
    onChangeName: changeNamePlugin,
    onAction: handlePluginAction,
    // createResourceConfig: workflowCreateConfig,
    validateConfig: validatePluginConfig,
    modals: pluginModals,
  } = usePluginResource();

  const {
    onCustomCreate: createData,
    onDelete: deleteData,
    onChangeName: changeNameData,
    onAction: handleDataAction,
    createResourceConfig: dataCreateConfig,
    modals: dataModals,
    validateConfig,
  } = useDataResource();

  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const { version: commitVersion } = useCommitVersion();

  let canCreate = useProjectAuth(
    EProjectPermission.CREATE_RESOURCE,
    projectId,
    spaceId,
  );

  // Version information exists, preview status cannot create resource
  if (commitVersion) {
    canCreate = false;
  }

  const projectRoles = useProjectRole(projectId);
  const hideMoreBtn = useMemo(
    // There is no permission, or there is version information, you need to hide the operation button.
    () => (projectRoles?.length ?? 0) === 0 || !!commitVersion,
    [projectRoles, commitVersion],
  );
  const { workflowResource, pluginResource, dataResource, initLoaded } =
    useResourceList();

  return (
    <div>
      <ResourceFolderCoze
        id={`${idPrefix}_${ProjectResourceGroupType.Workflow}`}
        groupType={ProjectResourceGroupType.Workflow}
        defaultResourceType={BizResourceTypeEnum.Workflow}
        resourceTree={workflowResource}
        canCreate={canCreate}
        initLoaded={initLoaded}
        onChangeName={changeNameWorkflow}
        onCustomCreate={createWorkflow}
        onDelete={deleteWorkflow}
        onAction={handleWorkflowAction}
        createResourceConfig={workflowCreateConfig}
        iconRender={workflowIconRender}
        hideMoreBtn={hideMoreBtn}
      />
      <ResourceFolderCoze
        id={`${idPrefix}_${ProjectResourceGroupType.Plugin}`}
        groupType={ProjectResourceGroupType.Plugin}
        defaultResourceType={BizResourceTypeEnum.Plugin}
        resourceTree={pluginResource}
        canCreate={canCreate}
        initLoaded={initLoaded}
        // business realization
        onChangeName={changeNamePlugin}
        onCustomCreate={createPlugin}
        onDelete={deletePlugin}
        onAction={handlePluginAction}
        iconRender={() => <IconCozPlugin />}
        hideMoreBtn={hideMoreBtn}
        validateConfig={validatePluginConfig}
      />
      <ResourceFolderCoze
        id={`${idPrefix}_${ProjectResourceGroupType.Data}`}
        groupType={ProjectResourceGroupType.Data}
        resourceTree={dataResource}
        canCreate={canCreate}
        initLoaded={initLoaded}
        createResourceConfig={dataCreateConfig}
        onChangeName={changeNameData}
        onDelete={deleteData}
        onAction={handleDataAction}
        onCustomCreate={createData}
        hideMoreBtn={hideMoreBtn}
        validateConfig={validateConfig}
        iconRender={({ resource }) => {
          console.log(resource);
          if (resource.id === VARIABLE_RESOURCE_ID) {
            return <IconCozVariables />;
          }
          if (resource.type === BizResourceTypeEnum.Database) {
            return <IconCozDatabase />;
          }
          if (resource.type === BizResourceTypeEnum.Knowledge) {
            return (
              <div className="flex items-center">
                {datasetIconMap[resource.biz_extend?.format_type]}
                {/**
                 * 1: Enable
                 * 2: Delete, generally not
                 * 3: Disable
                 */}
                {resource.biz_res_status === 3 ? (
                  <span className="ml-[3px]">已禁用</span>
                ) : null}
              </div>
            );
          }
          return <></>;
        }}
      />
      {workflowModals}
      {pluginModals}
      {dataModals}
    </div>
  );
};
