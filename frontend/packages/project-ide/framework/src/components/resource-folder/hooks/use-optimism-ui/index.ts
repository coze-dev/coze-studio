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
/* eslint-disable max-lines-per-function */
import { useState } from 'react';

import { noop } from 'lodash-es';

import {
  getResourceById,
  findResourceByPath,
  sortResourceList,
} from '../../utils';
import {
  type ChangeNameType,
  type CreateResourcePropType,
  type DragPropType,
  type ResourceType,
  type ResourceMapType,
  type IdType,
} from '../../type';
import { OPTIMISM_ID_PREFIX } from '../../constant';

export const useOptimismUI = ({
  enable,
  onChange = noop,
  onDrag = noop,
  onChangeName = noop,
  onCreate = noop,
  onDelete = noop,
  onRevertDelete = noop,
  changeResourceTree,
  scrollInView,
  resourceTreeRef,
  resourceMap,
}: {
  enable?: boolean;
  onChange?: (resource: ResourceType[]) => void;
  onDrag?: (v: DragPropType) => void;
  onChangeName?: (v: ChangeNameType) => void;
  onCreate?: (v: CreateResourcePropType) => void;
  onDelete?: (ids: ResourceType[]) => void;
  onRevertDelete?: (ids: ResourceType[]) => void;
  changeResourceTree: (v) => void;
  scrollInView: (selectedId: string) => void;
  resourceTreeRef: React.MutableRefObject<ResourceType>;
  resourceMap: React.MutableRefObject<ResourceMapType>;
}) => {
  const [optimismSavingMap, setOptimismSavingMap] = useState<
    Record<IdType, true>
  >({});

  const clearOptimismSavingMap = () => {
    setOptimismSavingMap({});
  };

  const addOptimismSavingItems = (_ids: string | string[]) => {
    const ids = _ids instanceof Array ? _ids : [_ids];
    setOptimismSavingMap({
      ...optimismSavingMap,
      ...ids.reduce(
        (pre, cur) => ({
          [cur]: true,
          ...pre,
        }),
        {},
      ),
    });
  };

  const handleDrag = (res: DragPropType) => {
    const { toId, resourceList } = res;
    if (!toId || !resourceList) {
      return;
    }
    resourceList.forEach(resource => {
      const target = findResourceByPath(
        resourceTreeRef.current,
        resource.path!.slice(0, resource.path!.length - 1),
      );
      if (target?.children) {
        target.children = target.children.filter(
          child => child.id !== resource.id,
        );
      }
    });
    const toTarget = getResourceById(resourceTreeRef.current, toId)?.resource;
    if (toTarget) {
      toTarget.children = sortResourceList([
        ...(toTarget.children || []),
        ...resourceList,
      ]);
    }

    addOptimismSavingItems(resourceList.map(resource => resource.id));

    changeResourceTree(resourceTreeRef.current);
    onDrag?.(res);
    onChange?.(resourceTreeRef.current?.children || []);
  };

  const handleChangeName = (res: ChangeNameType) => {
    const target = findResourceByPath(resourceTreeRef.current, res.path || []);
    if (!target) {
      return;
    }
    target.name = res.name;

    addOptimismSavingItems(target.id);

    changeResourceTree(resourceTreeRef.current);
    onChangeName?.(res);
    onChange?.(resourceTreeRef.current?.children || []);
  };
  const handleCreate = (res: CreateResourcePropType) => {
    const { path, type, name } = res;
    const target = findResourceByPath(resourceTreeRef.current, path);
    if (!target) {
      return;
    }
    const tempId = `${OPTIMISM_ID_PREFIX}${Number(new Date())}`;
    const tempFile = {
      id: tempId,
      type,
      name,
    };

    addOptimismSavingItems(tempId);

    target.children = sortResourceList([...(target.children || []), tempFile]);
    changeResourceTree(resourceTreeRef.current);
    onCreate(res);

    resourceMap.current[tempId] = tempFile;
    scrollInView?.(tempId);
    onChange?.(resourceTreeRef.current?.children || []);
  };
  const handleDelete = (res: ResourceType[]) => {
    onDelete(res);
  };
  const handleRevertDelete = (res: ResourceType[]) => {
    res.forEach(source => {
      const target = findResourceByPath(
        resourceTreeRef.current,
        source.path || [],
      );
      if (target) {
        target.status = 'normal';
      }
    });
    changeResourceTree(resourceTreeRef.current);
    onRevertDelete?.(res);
    onChange?.(resourceTreeRef.current?.children || []);
  };

  const commonArgs = { optimismSavingMap, clearOptimismSavingMap };

  if (!enable) {
    return {
      handleDrag: onDrag,
      handleChangeName: onChangeName,
      handleCreate: onCreate,
      handleDelete: onDelete,
      handleRevertDelete: onRevertDelete,
      ...commonArgs,
    };
  }

  return {
    handleDrag,
    handleChangeName,
    handleCreate,
    handleDelete,
    handleRevertDelete,
    ...commonArgs,
  };
};
