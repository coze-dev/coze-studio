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

import React, {
  type FC,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { type ProjectResourceGroupType } from '@coze-arch/bot-api/plugin_develop';
import {
  mapResourceTree,
  ResourceFolder,
  type ResourceFolderProps,
  type ResourceFolderRefType,
  ResourceTypeEnum,
  useIDEService,
} from '@coze-project-ide/framework';

import { usePrimarySidebarStore } from '@/stores';

import {
  type BizGroupTypeWithFolder,
  BizResourceContextMenuBtnType,
  type ResourceFolderCozeProps,
  type ResourceSubType,
} from './type';
import { ResourceGroupActions } from './resource-group-actions';
import { ResourceGroup } from './resource-group';
import { CustomResourceFolderShortcutService } from './plugins/shortcut-service';
import {
  useDeleteModal,
  useResourceFolderConfig,
  useResourceOpen,
  withRenameSync,
} from './hooks';
import { resourceTitleMap } from './constants';

import styles from './styles.module.less';

// eslint-disable-next-line @coze-arch/max-line-per-function
const ResourceFolderCozeImpl: FC<ResourceFolderCozeProps> = ({
  groupType,
  resourceTree,
  onDelete,
  onAction,
  onCreate,
  onCustomCreate,
  canCreate,
  iconRender,
  initLoaded,
  createResourceConfig,
  defaultResourceType,
  validateConfig,
  hideMoreBtn,
  ...props
}) => {
  const resourceMap = useMemo(
    () => mapResourceTree(resourceTree),
    [resourceTree],
  );

  const ref = useRef<ResourceFolderRefType>();
  const handleFocusResourceFolder = (visible: boolean) => {
    if (visible) {
      ref.current?.focus();
      ref.current?.closeContextMenu();
    }
  };

  const groupExpandMap = usePrimarySidebarStore(state => state.groupExpandMap);
  const updateGroupExpand = usePrimarySidebarStore(
    state => state.updateGroupExpand,
  );

  const handleExpandChange = (_expand: boolean) => {
    ref.current?.focus();
    updateGroupExpand?.(groupType, _expand);
  };

  const shortcutService = useIDEService<CustomResourceFolderShortcutService>(
    CustomResourceFolderShortcutService,
  );

  useEffect(() => {
    const disposable1 = shortcutService.onDuplicateEvent(event => {
      if (event.id !== props.id) {
        return;
      }
      const selectResources = Object.values(event.tempSelectedMap || {}).filter(
        item => item.type !== ResourceTypeEnum.Folder,
      );
      if (!selectResources?.length) {
        return;
      }
      if (selectResources.length === 1) {
        onAction?.(
          BizResourceContextMenuBtnType.DuplicateResource,
          selectResources[0],
        );
      }
    });
    const disposable2 = shortcutService.onCreateResourceEvent(event => {
      if (!canCreate) {
        return;
      }
      if (event.id !== props.id) {
        return;
      }
      // Multiple Create Resource menus without shortcuts
      if (createResourceConfig) {
        return;
      }
      // Shortcut-triggered creation of resources
      handleCreateResource(groupType);
    });

    return () => {
      disposable1.dispose();
      disposable2.dispose();
    };
  }, [
    defaultResourceType,
    groupType,
    onCustomCreate,
    onAction,
    shortcutService,
    canCreate,
    createResourceConfig,
  ]);

  useEffect(() => {
    const disposable = shortcutService.onRenameResource(event => {
      ref.current?.renameResource(event.id);
    });
    return () => {
      disposable.dispose();
    };
  }, [shortcutService]);

  const creatingResourceSubTypeRef = useRef<ResourceSubType>();
  const handleCreateResource = (
    _groupType: BizGroupTypeWithFolder,
    subType?: ResourceSubType,
  ) => {
    if (!canCreate) {
      return;
    }
    handleExpandChange(true);
    if (_groupType === ResourceTypeEnum.Folder) {
      ref.current?.createFolder();
    } else {
      if (onCustomCreate) {
        onCustomCreate(_groupType, subType);
      } else if (defaultResourceType) {
        creatingResourceSubTypeRef.current = subType;
        ref.current?.createResource(defaultResourceType);
      } else {
        console.error(
          '[ResourceFolderCoze]must specify defaultResourceType when use props onCreate creating resource',
        );
      }
    }
  };

  const handleDefaultCreateResource: ResourceFolderProps['onCreate'] =
    createEvent => onCreate?.(createEvent, creatingResourceSubTypeRef.current);

  const handleImportResource = (_groupType: ProjectResourceGroupType) => {
    if (!canCreate) {
      return;
    }
    handleExpandChange(true);
    onAction?.(BizResourceContextMenuBtnType.ImportLibraryResource);
  };

  const { handleDeleteResource, node: deleteModal } = useDeleteModal({
    onDelete,
  });

  const configProps = useResourceFolderConfig({
    groupType,
    iconRender,
    onAction,
    createResourceConfig,
    validateConfig,
    onCreateSubTypeResource: handleCreateResource,
    hideMoreBtn,
  });

  const { selectedResource, handleOpenResource } = useResourceOpen();
  return (
    <>
      <ResourceGroup
        className={styles['resource-folder-coze']}
        title={resourceTitleMap[groupType]}
        content={
          initLoaded ? (
            <ResourceFolder
              ref={ref as RefObject<ResourceFolderRefType>}
              resourceTree={resourceTree}
              resourceMap={resourceMap}
              onDelete={handleDeleteResource}
              onCreate={handleDefaultCreateResource}
              selected={selectedResource}
              onSelected={handleOpenResource}
              defaultResourceType={defaultResourceType}
              {...configProps}
              {...props}
            />
          ) : null
        }
        expand={groupExpandMap[groupType]}
        onExpandChange={handleExpandChange}
        actions={
          canCreate ? (
            <ResourceGroupActions
              createResourceConfig={createResourceConfig}
              groupType={groupType}
              onCreateResource={handleCreateResource}
              onImportResource={handleImportResource}
              onActionVisibleChange={handleFocusResourceFolder}
            />
          ) : null
        }
      />
      {deleteModal}
    </>
  );
};

export const ResourceFolderCoze = withRenameSync(ResourceFolderCozeImpl);
