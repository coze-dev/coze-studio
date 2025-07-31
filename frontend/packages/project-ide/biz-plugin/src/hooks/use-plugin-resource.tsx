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

/* eslint-disable @coze-arch/max-line-per-function */
import React, { type ReactNode, useCallback, useState } from 'react';

import {
  type ResourceFolderProps,
  type ResourceType,
  useProjectId,
  useSpaceId,
} from '@coze-project-ide/framework';
import {
  BizResourceContextMenuBtnType,
  type BizResourceType,
  BizResourceTypeEnum,
  type ResourceFolderCozeProps,
  useOpenResource,
  usePrimarySidebarStore,
} from '@coze-project-ide/biz-components';
import { I18n } from '@coze-arch/i18n';
// import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { From } from '@coze-agent-ide/plugin-shared';
import {
  CreateFormPluginModal,
  usePluginApisModal,
} from '@coze-agent-ide/bot-plugin/component';
import { Toast } from '@coze-arch/coze-design';

import { useResourceOperation } from './use-resource-operation';
// import { useImportLibraryPlugin } from './use-import-library-plugin';

type UsePluginResourceReturn = Pick<
  ResourceFolderCozeProps,
  | 'onCustomCreate'
  | 'onDelete'
  | 'onChangeName'
  | 'onAction'
  | 'createResourceConfig'
  | 'iconRender'
  | 'validateConfig'
> & { modals: ReactNode };

const PLUGIN_NAME_MAX_LEN = 30;
export type Validator = Required<
  Required<ResourceFolderProps>['validateConfig']
>['customValidator'];

const usePluginResource = (): UsePluginResourceReturn => {
  // const display_local_plugin = useSpaceStore(
  //   store => store.space.display_local_plugin,
  // );

  const refetch = usePrimarySidebarStore(state => state.refetch);
  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const openResource = useOpenResource();

  const [showFormPluginModel, setShowFormPluginModel] = useState(false);

  const onCustomCreate: ResourceFolderCozeProps['onCustomCreate'] = (
    resourceType,
    subType,
  ) => {
    console.log('[ResourceFolder]on custom create>>>', resourceType, subType);
    setShowFormPluginModel(true);
  };

  const onChangeName = useCallback<
    Required<ResourceFolderProps>['onChangeName']
  >(
    async changeNameEvent => {
      try {
        console.log('[ResourceFolder]on change name>>>', changeNameEvent);
        const resp = await PluginDevelopApi.UpdatePluginMeta({
          plugin_id: changeNameEvent.id,
          name: changeNameEvent.name,
        });
        console.log('[ResourceFolder]rename plugin response>>>', resp);
      } catch (e) {
        console.log('[ResourceFolder]rename plugin error>>>', e);
      } finally {
        refetch();
      }
    },
    [refetch],
  );

  const onDelete = useCallback(
    async (resources: ResourceType[]) => {
      try {
        console.log('[ResourceFolder]on delete>>>', resources);
        const resp = await PluginDevelopApi.DelPlugin({
          plugin_id: resources.filter(
            r => r.type === BizResourceTypeEnum.Plugin,
          )?.[0].res_id,
        });
        Toast.success(I18n.t('project_plugin_delete_success_toast'));
        refetch();
        console.log('[ResourceFolder]delete plugin response>>>', resp);
      } catch (e) {
        console.log('[ResourceFolder]delete plugin error>>>', e);
      }
    },
    [refetch, spaceId],
  );

  // const { modal: pluginModal, importLibrary } = useImportLibraryPlugin({
  //   projectId,
  // });
  const {
    node: pluginModal,
    open: openPlugin,
    close: closePlugin,
  } = usePluginApisModal({
    from: From.ProjectIde,
    pluginApiList: [],
    projectId,
    showCopyPlugin: true,
    showButton: false,
    hideCreateBtn: true,
    onCopyPluginCallback: ({ pluginID, name }) => {
      if (pluginID) {
        resourceOperation({
          scene: ResourceCopyScene.CopyResourceFromLibrary,
          resource: {
            id: pluginID,
            res_id: pluginID,
            name: name ?? '',
          },
        });
        closePlugin();
      }
    },
    onCreateSuccess: async val => {
      if (!val?.pluginId) {
        return;
      }
      await refetch?.();
      openResource({
        resourceType: BizResourceTypeEnum.Plugin,
        resourceId: val?.pluginId,
      });
      closePlugin();
    },
    isShowStorePlugin: false,
  });
  const resourceOperation = useResourceOperation({ projectId });
  const onAction = (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => {
    console.log('on action>>>', action, resource);
    switch (action) {
      case BizResourceContextMenuBtnType.ImportLibraryResource:
        // return importLibrary();
        return openPlugin();
      case BizResourceContextMenuBtnType.DuplicateResource:
        return resourceOperation({
          scene: ResourceCopyScene.CopyProjectResource,
          resource,
        });
      case BizResourceContextMenuBtnType.MoveToLibrary:
        return resourceOperation({
          scene: ResourceCopyScene.MoveResourceToLibrary,
          resource,
        });
      case BizResourceContextMenuBtnType.CopyToLibrary:
        return resourceOperation({
          scene: ResourceCopyScene.CopyResourceToLibrary,
          resource,
        });
      default:
        console.warn('[PluginResource]unsupported action>>>', action);
        break;
    }
  };
  const validateNameBasic: Validator = ({ label }) => {
    // Check if name is empty
    if (!label) {
      return I18n.t('create_plugin_modal_name1_error');
    }

    if (label.length > PLUGIN_NAME_MAX_LEN) {
      return I18n.t('project_resource_sidebar_warning_length_exceeds');
    }

    // Detect the naming rules for names, and add support for Chinese in China
    if (IS_OVERSEA || IS_BOE) {
      if (!/^[\w\s]+$/.test(label)) {
        return I18n.t('create_plugin_modal_nameerror');
      }
    } else {
      if (!/^[\w\s\u4e00-\u9fa5]+$/u.test(label)) {
        return I18n.t('create_plugin_modal_nameerror_cn');
      }
    }

    return '';
  };

  return {
    onChangeName,
    onAction,
    onDelete,
    onCustomCreate,
    // createResourceConfig,
    modals: [
      <CreateFormPluginModal
        projectId={projectId}
        isCreate={true}
        visible={showFormPluginModel}
        onSuccess={async pluginID => {
          await refetch?.();
          openResource({
            resourceType: BizResourceTypeEnum.Plugin,
            resourceId: pluginID,
          });
        }}
        onCancel={() => {
          setShowFormPluginModel(false);
        }}
      />,
      pluginModal,
    ],
    validateConfig: {
      customValidator: params => validateNameBasic(params) || '',
    },
  };
};

export default usePluginResource;
