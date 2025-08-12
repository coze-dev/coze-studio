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

import {
  type IdType,
  type ResourceType,
  type ResourceMapType,
  ResourceTypeEnum,
} from '../type';
import { ROOT_KEY, ROOT_NODE } from '../constant';

export const RESOURCE_FOLDER_COMMAND_PREFIX = 'resource-folder-command-prefix';

export const createUniqId = (key: string, suffix: string) =>
  `${RESOURCE_FOLDER_COMMAND_PREFIX}_${key}_${suffix}`;

export const findResourceByPath = (
  resourceTree: ResourceType,
  path: IdType[],
): ResourceType | undefined => {
  let currentIndex = 0;
  let currentResource: undefined | ResourceType = resourceTree;

  if (String(currentResource.id) !== String(path[currentIndex])) {
    return undefined;
  }

  currentIndex += 1;

  while (currentIndex < path.length && currentResource) {
    currentResource = (currentResource.children || []).find(
      child => String(child.id) === String(path[currentIndex]),
    );
    currentIndex += 1;
  }

  return currentResource;
};

export const getParentResource = (
  resourceTree: ResourceType,
  targetResource: ResourceType,
) => getResourceById(resourceTree, targetResource.id)?.parent;

export const getResourceById = (
  resourceTree: ResourceType,
  id: IdType,
): {
  resource: ResourceType | null;
  parent: ResourceType | null;
  path: IdType[];
} | null => {
  let parent: ResourceType | null = null;

  let result: {
    resource: ResourceType | null;
    parent: ResourceType | null;
    path: IdType[];
  } | null = null;
  const dfs = (resource: ResourceType, _path: IdType[]) => {
    if (result) {
      return;
    }

    if (String(resource.id) === String(id)) {
      result = {
        resource,
        parent,
        path: _path,
      };
      return;
    }

    if (resource.children) {
      const currentParent = parent;
      parent = resource;
      resource.children.forEach(child => {
        dfs(child, [..._path, child.id]);
      });
      parent = currentParent;
    }

    return null;
  };

  dfs(resourceTree, [resourceTree.id]);

  return result;
};

/**
 * When modifying keys with shift, select all the middle from from to to, including the drill-down files. dfs
 */
export const getResourceListFromIdToId = ({
  resourceTree,
  from,
  to,
  options,
}: {
  resourceTree: ResourceType;
  from: IdType;
  to: IdType;
  options?: { collapsedMap?: Record<string, boolean> };
}): ResourceType[] | IdType[] => {
  const { collapsedMap } = options || {};
  const result: Array<IdType> = [];
  let isStart = false;

  const dfs = (resource: ResourceType, _path: IdType[]) => {
    const shot =
      String(resource.id) === String(from) ||
      String(resource.id) === String(to);
    if (!isStart && shot) {
      isStart = true;
      result.push(resource.id);
    } else if (isStart) {
      result.push(resource.id);
      if (shot) {
        isStart = false;
      }
    }

    if (resource.children && !collapsedMap?.[resource.id]) {
      resource.children.forEach(child => {
        dfs(child, [..._path, child.id]);
      });
    }
  };

  dfs(resourceTree, [resourceTree.id]);

  return result;
};

export const getAllResourcesInFolder = (
  resourceTree: ResourceType | ResourceType[],
) => {
  const folders = resourceTree instanceof Array ? resourceTree : [resourceTree];

  const result: ResourceType[] = [];

  const dfs = (resource: ResourceType) => {
    if (!resource) {
      return;
    }

    if (resource.children) {
      resource.children.forEach(child => {
        dfs(child);
      });
    }

    if (resource.type !== 'folder') {
      result.push(resource);
    }
  };

  folders.forEach(folder => {
    dfs(folder);
  });

  return result;
};

export const sortResourceList = (
  resourceList: ResourceType[],
): ResourceType[] => {
  const sortFunc = (a, b) => {
    const leftName = a.name?.toLowerCase?.() || '';
    const rightName = b.name?.toLowerCase?.() || '';
    if (leftName < rightName) {
      return -1;
    }
    if (leftName > rightName) {
      return 1;
    }
    return 0;
  };

  const folderList = resourceList
    .filter(source => source.type === ResourceTypeEnum.Folder)
    .sort((a, b) => sortFunc(a, b));
  const sourceList = resourceList
    .filter(source => source.type !== ResourceTypeEnum.Folder)
    .sort((a, b) => sortFunc(a, b));

  return folderList.concat(sourceList) as ResourceType[];
};

// If you want to optimize the algorithm in the future, you have to record the height of each folder in the tree leveling algorithm, so that you don't need to repeatedly calculate when changing. packages/api-builder/base/src/utils/resource-folder/index.ts mapResourceTree
export const calcOffsetTopByCollapsedMap = (props: {
  selectedId: string;
  resourceTree: ResourceType;
  collapsedMap: Record<IdType, boolean>;
  itemHeight: number;
}) => {
  const { selectedId, resourceTree, collapsedMap, itemHeight } = props;

  let num = -1; // Because starting from root, root does not display, it starts from -1
  let finish = false;

  const dfs = (resource: ResourceType) => {
    if (!resource || finish) {
      return;
    }

    num += 1;

    if (selectedId === resource.id) {
      finish = true;
      return;
    }

    if (resource.children && !collapsedMap[resource.id]) {
      resource.children.forEach(child => {
        dfs(child);
      });
    }
  };

  dfs(resourceTree);

  return (num - 1) * itemHeight;
};

export const travelResource = (
  resource: ResourceType,
  cb: (item: ResourceType) => boolean,
) => {
  if (resource) {
    const shouldContinue = cb(resource);

    if (!shouldContinue) {
      return;
    }

    if (resource.children) {
      resource.children.forEach(child => {
        travelResource(child, cb);
      });
    }
  }
};

export const getResourceTravelIds = (ctx: {
  resource: ResourceType;
  resourceMap: Record<string, ResourceType>;
  collapsedMap: Record<string, boolean>;
}): string[] => {
  const { resource, resourceMap, collapsedMap } = ctx;

  const ids: string[] = [];

  travelResource(resource, item => {
    const info = resourceMap[item.id];

    // Deleted resources and folders are not displayed
    if (!info || info.status === 'deprecated') {
      return false;
    }

    // Folding folders after folding, do not traverse only nodes
    if (info.type === ResourceTypeEnum.Folder && collapsedMap[info.id]) {
      ids.push(item.id);
      return false;
    }
    ids.push(item.id);

    return true;
  });

  return ids.filter(id => id !== ROOT_KEY);
};

export const findLastResource = (ctx: {
  id: string;
  resource: ResourceType;
  resourceMap: Record<string, ResourceType>;
  collapsedMap: Record<string, boolean>;
}) => {
  const { resource, resourceMap, collapsedMap, id } = ctx;

  const ids = getResourceTravelIds({
    resource,
    resourceMap,
    collapsedMap,
  });

  const index = ids.findIndex(item => item === id);

  if (index < 0) {
    return;
  }

  const finalIndex = (index - 1 + ids.length) % ids.length;

  return {
    id: ids[finalIndex],
    info: resourceMap[ids[finalIndex]],
  };
};

export const findNextResource = (ctx: {
  id: string;
  resource: ResourceType;
  resourceMap: Record<string, ResourceType>;
  collapsedMap: Record<string, boolean>;
}) => {
  const { resource, resourceMap, collapsedMap, id } = ctx;

  const ids = getResourceTravelIds({
    resource,
    resourceMap,
    collapsedMap,
  });

  const index = ids.findIndex(item => item === id);

  if (index < 0) {
    return;
  }

  const final = (index + 1) % ids.length;

  return {
    id: ids[final],
    info: resourceMap[ids[final]],
  };
};

export const validateSameNameInFolder = ({
  folder,
  editResource,
}: {
  folder: ResourceType;
  editResource: ResourceType;
}): string => {
  if (!folder || !editResource) {
    return '';
  }
  const children = (folder.children || []).filter(
    child => child.id !== editResource.id,
  );

  const hasSameName = children.some(child => child.name === editResource.name);

  return hasSameName
    ? `有一个文件或文件夹 ${editResource.name} 已经存在在当前位置，请使用一个不同的名称`
    : '';
};

export const mapResourceTree = (resourceTree): ResourceMapType => {
  if (!resourceTree) {
    return {};
  }
  const fullTree = {
    ...ROOT_NODE,
    children: resourceTree instanceof Array ? resourceTree : [resourceTree],
  };

  const result: ResourceMapType = {};

  const dfs = (
    resource,
    path: string[],
  ): { maxDeep: number; editDraft?: boolean } => {
    if (!resource) {
      return { maxDeep: path.length - 1 };
    }

    // You need to add one to the folder, because you can add files.
    let maxDeep = path.length + (resource.type === 'folder' ? 1 : 0);

    // Is the current resource in a committed state?
    let editDraft = resource.edit_status === 'draft';

    if (resource.children) {
      resource.children.forEach(child => {
        const { maxDeep: deep, editDraft: status } = dfs(child, [
          ...path,
          child.id,
        ]);
        maxDeep = Math.max(maxDeep, deep);

        // Folder editDraft follows the draft, as long as there is one inside as a draft, this folder is also a draft
        editDraft = !!(editDraft || status);
      });
    }

    result[String(resource.id)] = {
      ...resource,
      path,
      maxDeep: maxDeep - path.length,
      /**
       * release with business
       */
      // draft: editDraft,
      // problem: {
      //   status: 'warning',
      //   number: 12,
      // },
    };

    return { maxDeep, editDraft };
  };

  dfs(fullTree, [fullTree.id]);

  return result;
};

export const combineExtraObject = (
  mainObj: Record<IdType, any>,
  extraMap: Record<IdType, any>,
) =>
  Object.keys(mainObj).reduce(
    (pre, cur) => ({
      ...pre,
      [cur]: {
        ...mainObj[cur],
        ...extraMap[cur],
      },
    }),
    {},
  );

export const flatTree = (
  tree: ResourceType,
  map: ResourceMapType,
  collapsedMap: Record<string, boolean>,
) => {
  const result: ResourceType[] = [];

  const dfs = (resource: ResourceType) => {
    result.push(map[resource.id]);

    if (resource.children && !collapsedMap[resource.id]) {
      resource.children.forEach(child => {
        dfs(child);
      });
    }

    return null;
  };

  dfs(tree);

  return result;
};

/**
 * Calculates the location of the newly created resource in the current folder.
 * Folder: under the current folder top
 * Resources: At the end of the folder under the current folder, at the top of all resources
 */
export const getCreateResourceIndex = ({
  resourceList,
  parentId,
  type,
}: {
  resourceList: ResourceType[];
  parentId: string;
  type: ResourceTypeEnum | string;
}) => {
  let i = 0;
  let inFolder = false;
  let parentPath: string[] = [];
  while (i < resourceList.length) {
    const resource = resourceList[i];

    if (inFolder && (resource.path?.length || 0) <= parentPath.length) {
      return i;
    }
    if (
      inFolder &&
      resource.type !== ResourceTypeEnum.Folder &&
      (resource.path?.length || 0) - 1 === parentPath.length
    ) {
      return i;
    }

    if (resource.id === parentId) {
      inFolder = true;
      parentPath = resource.path || [];
      if (type === ResourceTypeEnum.Folder) {
        return i + 1;
      }
    }

    i += 1;
  }
  return i;
};

export function baseValidateNames(props: { label: string; nameTitle: string }) {
  const { label, nameTitle } = props;

  const simple = true;

  // Set the default value to avoid propExtra passing only one configuration

  // Check if name is empty
  if (!label) {
    return simple ? 'Empty Key' : `${nameTitle} name can not be empty`;
  }

  if (label.length > 64) {
    return simple ? 'Length exceeds' : `${nameTitle} name length exceeds limit`;
  }

  // Must begin with a letter
  if (!/^[A-Za-z]/.test(label)) {
    return simple
      ? 'Must start with letter'
      : `${nameTitle} name must start with a letter`;
  }

  // Detection of naming rules for names
  if (!/^[A-Za-z][0-9a-zA-Z_]*$/.test(label)) {
    return simple
      ? 'only ASCII letters, digits, and _'
      : `${nameTitle} name can only contain ASCII letters, digits, and _`;
  }

  return '';
}
