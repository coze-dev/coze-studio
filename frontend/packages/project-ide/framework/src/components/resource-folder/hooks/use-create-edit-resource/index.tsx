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

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { Toast } from '@coze-arch/coze-design';

import { baseValidateNames, getCreateResourceIndex } from '../../utils';
import {
  type EditItemType,
  type ChangeNameType,
  type ResourceMapType,
  type ItemType,
  type IdType,
  type CreateResourcePropType,
  type ResourceType,
  ResourceTypeEnum,
  type ValidatorConfigType,
  type ConfigType,
} from '../../type';
import {
  ItemStatus,
  MAX_DEEP,
  BaseResourceContextMenuBtnType,
  ROOT_KEY,
} from '../../constant';
import { useCustomValidator } from './use-custom-validator';

const CREATE_RESOURCE_ID = '-1';

const useCreateEditResource = ({
  folderEnable,
  defaultResourceType,
  tempSelectedMapRef,
  registerEvent,
  setCollapsedMap,
  onChangeName,
  onCreate,
  resourceMap,
  selectedIdRef,
  resourceTreeRef,
  onDelete,
  validateConfig,
  config,
  resourceList,
}: {
  folderEnable?: boolean;
  defaultResourceType?: string;
  registerEvent: (key: BaseResourceContextMenuBtnType, fn: (e) => void) => void;
  setCollapsedMap: (id: IdType, v: boolean) => void;
  resourceTreeRef: React.MutableRefObject<ResourceType>;
  tempSelectedMapRef: React.MutableRefObject<Record<string, ResourceType>>;
  disabled: React.MutableRefObject<boolean>;
  isFocusRef: React.MutableRefObject<boolean>;
  onChangeName?: (v: ChangeNameType) => void;
  resourceMap: React.MutableRefObject<ResourceMapType>;
  onCreate?: (v: CreateResourcePropType) => void;
  onDelete?: (v: ResourceType[]) => void;
  selectedIdRef: React.MutableRefObject<string>;
  validateConfig?: ValidatorConfigType;
  config?: ConfigType;
  resourceList: React.MutableRefObject<ResourceType[]>;
}): {
  context: EditItemType;
  onCreateResource: (type: ItemType) => void;
  isInEditModeRef: React.MutableRefObject<boolean>;
  handleRenderList: (
    list: ResourceType[],
    createResourceInfo?: EditItemType['createResourceInfo'],
  ) => (typeof CREATE_RESOURCE_ID | ResourceType)[];
  handleRename: (resourceId: IdType) => void;
} => {
  const [errorMsg, setErrorMsg] = useState('');
  const errorMsgRef = useRef('');

  const [isInEditMode, setIsInEditMode] = useState(false);
  const isInEditModeRef = useRef(false);
  const setInEditMode = (v: boolean) => {
    isInEditModeRef.current = v;
    setIsInEditMode(v);
  };

  const [editResource, setEditResource] = useState<ResourceType | null>(null);
  const editResourceRef = useRef<ResourceType | null>(null);

  const [createResourceInfo, setCreateResourceInfo] = useState<{
    /**
     * The index used to locate the render position
     * Resources are behind folders and in front of all resources
     * The folder is at the front of the current folder
     */
    index: number;
    parentId: IdType;
    type: ItemType;
  } | null>(null);
  const createResourceInfoRef = useRef<{
    parentId: IdType;
    type: ItemType;
  } | null>(null);

  const preName = useRef<null | string>(null);
  const nextName = useRef<null | string>(null);

  const reset = () => {
    setEditResource(null);
    editResourceRef.current = null;

    setCreateResourceInfo(null);
    createResourceInfoRef.current = null;

    setInEditMode(false);
    setErrorMsg('');
    errorMsgRef.current = '';
    preName.current = null;
    nextName.current = null;
  };

  const handleRename = (resourceId: IdType) => {
    const target = resourceMap.current[resourceId];
    if (target && target.status !== ItemStatus.Disabled) {
      setEditResource(target);
      editResourceRef.current = target;
      setInEditMode(true);
      preName.current = target.name;
      nextName.current = target.name;
    }
  };

  const onEditName = () => {
    const v = tempSelectedMapRef.current;
    if (Object.keys(v).filter(key => key !== ROOT_KEY).length === 1) {
      const tempSelected = Object.values(v)[0];
      handleRename(tempSelected.id);
    }
  };

  const handleSave = (_nextValue?: string) => {
    const nextValue =
      _nextValue === undefined ? nextName.current || '' : _nextValue;
    if (editResourceRef.current) {
      if (editResourceRef.current.id === CREATE_RESOURCE_ID) {
        if (nextValue !== '' && createResourceInfoRef.current?.parentId) {
          onCreate?.({
            parentId: createResourceInfoRef.current?.parentId,
            name: nextValue,
            type: createResourceInfoRef.current?.type,
            path:
              resourceMap.current?.[createResourceInfoRef.current?.parentId]
                ?.path || [],
          });
        }
      } else {
        if (
          nextValue !== '' &&
          nextValue !== preName.current &&
          editResourceRef.current.id
        ) {
          onChangeName?.({
            id: editResourceRef.current.id,
            name: nextValue,
            type: editResourceRef.current.type,
            path: resourceMap.current[editResourceRef.current.id].path,
            resource: resourceMap.current[
              editResourceRef.current.id
            ] as ResourceType,
          });
        }
      }
    }
    reset();
  };

  const updateErrorMsg = (error: string) => {
    if (error) {
      setErrorMsg(error);
      errorMsgRef.current = error;
      return;
    }

    /**
     * same name test
     */
    // if (editResourceRef.current) {
    //   const parentFolder = createResourceInfoRef.current
    //     ? getResourceById(
    //         resourceTreeRef.current,
    //         createResourceInfoRef.current.parentId,
    //       )?.resource
    //     : getParentResource(resourceTreeRef.current, editResourceRef.current);

    //   if (parentFolder) {
    //     const sameNameValidate = validateSameNameInFolder({
    //       folder: parentFolder,
    //       editResource: {
    //         ...editResourceRef.current,
    //         name: v,
    //       },
    //     });

    //     if (sameNameValidate) {
    //       setErrorMsg(sameNameValidate);
    //       errorMsgRef.current = sameNameValidate;
    //       return;
    //     }
    //   }
    // }

    setErrorMsg('');
    errorMsgRef.current = '';
  };

  const { validateAndUpdate } = useCustomValidator({
    validator: validateConfig?.customValidator || (baseValidateNames as any),
    callback: updateErrorMsg,
  });

  const handleChangeName = (v: null | string) => {
    nextName.current = v;

    if (createResourceInfoRef?.current) {
      /**
       * new resource
       */
      const parentPath =
        resourceMap.current[createResourceInfoRef?.current?.parentId]?.path;

      validateAndUpdate({
        type: 'create',
        label: v || '',
        parentPath: parentPath || [],
        resourceTree: resourceTreeRef.current,
        id: CREATE_RESOURCE_ID,
      });
    } else if (editResourceRef?.current) {
      /**
       * editing resources
       */
      const path = editResourceRef?.current?.path || [];
      const parentPath = path.slice(0, path?.length - 1);

      validateAndUpdate({
        type: 'edit',
        label: v || '',
        parentPath: parentPath || [],
        resourceTree: resourceTreeRef.current,
        id: editResourceRef.current.id,
      });
    }
  };

  const onCreateResource = async (_type: ItemType) => {
    const type = _type || defaultResourceType;
    if (!type) {
      return;
    }

    if (!folderEnable && type === ResourceTypeEnum.Folder) {
      return;
    }

    let selectResource = Object.values(tempSelectedMapRef.current || {})[0];

    if (!selectResource) {
      selectResource = resourceMap.current[selectedIdRef.current];
    }

    if (!selectResource) {
      selectResource = resourceMap.current[ROOT_KEY];
    }

    if (selectResource.type !== 'folder' && selectResource?.path) {
      // If it is not a folder, select the parent folder.
      selectResource =
        resourceMap.current[
          selectResource.path[selectResource.path.length - 2]
        ];
    }

    if (
      (selectResource?.path?.length || 0) +
        (type === ResourceTypeEnum.Folder ? 1 : 0) >
      (config?.maxDeep || MAX_DEEP)
    ) {
      Toast.warning(`Can't create ${type}. MaxDeep is 5`);
      return;
    }

    if (selectResource) {
      let parentId = selectResource.id;
      if (selectResource.type !== 'folder') {
        parentId = selectResource.path?.[selectResource.path?.length - 2] || '';
      }

      preName.current = '';
      nextName.current = '';

      setCollapsedMap(parentId, false);

      await new Promise(resolve => {
        setTimeout(() => {
          resolve(null);
        }, 0);
      });

      editResourceRef.current = {
        id: CREATE_RESOURCE_ID,
        name: '',
        type,
      };
      setEditResource(editResourceRef.current);
      createResourceInfoRef.current = {
        parentId,
        type,
      };
      const index = getCreateResourceIndex({
        resourceList: resourceList.current,
        parentId,
        type,
      });
      setCreateResourceInfo({
        parentId,
        type,
        index,
      });
      setInEditMode(true);
    }
  };

  useEffect(() => {
    registerEvent(BaseResourceContextMenuBtnType.EditName, () => {
      if (!editResourceRef.current) {
        onEditName();
      }
    });
    registerEvent(BaseResourceContextMenuBtnType.Delete, () => {
      const selectedResource = Object.values(tempSelectedMapRef.current).filter(
        v => v.id !== ROOT_KEY,
      );
      if (selectedResource.length > 0) {
        onDelete?.(selectedResource);
      }
    });
    registerEvent(BaseResourceContextMenuBtnType.CreateFolder, () => {
      onCreateResource(ResourceTypeEnum.Folder);
    });
    registerEvent(BaseResourceContextMenuBtnType.CreateResource, type => {
      onCreateResource(type);
    });
  }, []);

  const handleRenderList = (
    list: ResourceType[],
    info?: EditItemType['createResourceInfo'],
  ) => {
    if (!info) {
      return list as (typeof CREATE_RESOURCE_ID | ResourceType)[];
    }
    const { index } = info;
    return [
      ...list.slice(0, index),
      CREATE_RESOURCE_ID,
      ...list.slice(index, list.length),
    ] as (typeof CREATE_RESOURCE_ID | ResourceType)[];
  };

  return {
    context: {
      isInEditMode,
      editResourceId: editResource?.id,
      createResourceInfo,
      handleChangeName,
      errorMsg,
      errorMsgRef,
      handleSave,
    },
    onCreateResource,
    isInEditModeRef,
    handleRenderList,
    handleRename,
  };
};

export { useCreateEditResource, CREATE_RESOURCE_ID };
