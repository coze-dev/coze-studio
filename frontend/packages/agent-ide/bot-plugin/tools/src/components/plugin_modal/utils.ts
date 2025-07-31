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
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any -- some history can't be changed */
import { nanoid } from 'nanoid';
import { cloneDeep, has, isEmpty, isNumber, isObject } from 'lodash-es';
import {
  type APIParameter,
  ParameterLocation,
  ParameterType,
  DefaultParamSource,
} from '@coze-arch/bot-api/plugin_develop';

import { ARRAYTAG, ROWKEY, childrenRecordName } from './config';

// Traverse the tree and return the target ID path
export const findPathById = ({
  data,
  callback,
  childrenName = childrenRecordName,
  path = [],
}: {
  data: any;
  callback: (item: APIParameter, path: Array<number>) => void;
  childrenName?: string;
  path?: Array<number>;
}) => {
  for (let i = 0; i < data.length; i++) {
    const clonePath = JSON.parse(JSON.stringify(path));
    clonePath.push(i);
    callback(data[i], clonePath);
    if (data[i][childrenName] && data[i][childrenName].length > 0) {
      findPathById({
        data: data[i][childrenName],
        callback,
        childrenName,
        path: clonePath,
      });
    }
  }
};

// Add layer depth markers to each layer of objects
export const addDepthAndValue = (
  tree: any,
  valKey: 'global_default' | 'local_default' = 'global_default',
  depth = 1,
) => {
  if (!Array.isArray(tree)) {
    return;
  }
  // Traverse each node in the tree
  for (const node of tree) {
    // Add a depth identifier to the current node
    node.deep = depth;
    if (node[valKey]) {
      node.value = node[valKey];
    }
    // If the current node has a sub-node, add a depth identifier to the sub-node recursively
    if (node[childrenRecordName]) {
      addDepthAndValue(node[childrenRecordName], valKey, depth + 1);
    }
  }
};

// Push the depth information into an array, and finally take the maximum value
export const handleDeepArr = (tree: any, deepArr: Array<number> = []) => {
  if (!Array.isArray(tree)) {
    return;
  }
  // Traverse each node in the tree
  for (const node of tree) {
    // Add a depth identifier to the current node
    if (isNumber(node.deep)) {
      deepArr.push(node.deep);
    }

    if (node[childrenRecordName]) {
      handleDeepArr(node[childrenRecordName], deepArr);
    }
  }
};

// Return to maximum depth
export const maxDeep = (tree: any) => {
  if (!Array.isArray(tree) || tree.length === 0) {
    return 0;
  }
  const arr: Array<number> = [];
  handleDeepArr(tree, arr);
  return Math.max.apply(null, arr);
};

interface DefaultNode {
  isArray?: boolean;
  iscChildren?: boolean;
  deep?: number;
}

// Default sub-node
export const defaultNode = ({
  isArray = false,
  iscChildren = false,
  deep = 1,
}: DefaultNode = {}) => ({
  [ROWKEY]: nanoid(),
  name: isArray ? ARRAYTAG : '',
  desc: '',
  type: ParameterType.String,
  location: iscChildren ? undefined : ParameterLocation.Query,
  is_required: true,
  sub_parameters: [],
  deep,
});

// Delete the current node
export const deleteNode = (data: any, targetKey: string) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i][ROWKEY] === targetKey) {
      data.splice(i, 1);
      return true;
    } else if (
      data[i][childrenRecordName] &&
      data[i][childrenRecordName].length > 0
    ) {
      if (deleteNode(data[i][childrenRecordName], targetKey)) {
        return true;
      }
    }
  }
  return false;
};

// Delete all sub-nodes
export const deleteAllChildNode = (data: any, targetKey: string) => {
  for (const item of data) {
    if (item[ROWKEY] === targetKey) {
      item[childrenRecordName] = [];
      return true;
    } else if (
      Array.isArray(item[childrenRecordName]) &&
      item[childrenRecordName].length > 0
    ) {
      if (deleteAllChildNode(item[childrenRecordName], targetKey)) {
        return true;
      }
    }
  }
  return false;
};

interface UpdateNodeById {
  data: APIParameter[];
  targetKey: string;
  field: string;
  value: any;
  /** Whether the sub-node of the array needs to inherit the field values of the parent node, currently only the visibility switch needs to inherit */
  inherit?: boolean;
}

const updateNodeByVal = (data: any, field: any, val: any) => {
  for (const item of data) {
    item[field] = val;
    if (Array.isArray(item[childrenRecordName])) {
      updateNodeByVal(item[childrenRecordName], field, val);
    }
  }
};

// Update node information
export const updateNodeById = ({
  data,
  targetKey,
  field,
  value,
  inherit = false,
}: UpdateNodeById) => {
  for (const item of data) {
    if (item[ROWKEY] === targetKey) {
      // @ts-expect-error -- linter-disable-autofix
      item[field] = value;
      if (
        inherit &&
        Array.isArray(item[childrenRecordName]) &&
        item[childrenRecordName].length > 0
      ) {
        updateNodeByVal(item[childrenRecordName], field, value);
      }
      return;
    } else if (
      Array.isArray(item[childrenRecordName]) &&
      item[childrenRecordName].length > 0
    ) {
      updateNodeById({
        data: item[childrenRecordName],
        targetKey,
        field,
        value,
      });
    }
  }
};

// Find the corresponding template value according to the path
export const findTemplateNodeByPath = (
  dsl: any,
  path: Array<string | number>,
) => {
  let node = cloneDeep(dsl);
  const newPath = [...path]; //Create a new path to avoid modifying the original path
  for (let i = 0; i < path.length; i++) {
    // If there is a node, it means that a sub-node is added to the source data node.
    if (node[path[i]]) {
      node = node[path[i]];
    } else {
      // If it doesn't exist, it means that the newly added node adds a sub-node. At this time, you need to point the path to the original node (the first node).
      node = node[0];
      newPath[i] = 0;
    }
  }
  return newPath;
};

// Converting trees to objects
export const transformTreeToObj = (tree: any, checkType = true): any =>
  // Each level of the tree represents a set of properties of an object

  tree.reduce((acc: any, item: any) => {
    let arrTemp = [];
    switch (item.type) {
      case ParameterType.String:
        if (item.value) {
          acc[item.name] = item.value;
        }
        if (!checkType) {
          acc[item.name] = item.value;
        }
        break;
      case ParameterType.Integer:
      case ParameterType.Number:
        if (item.value) {
          acc[item.name] = Number(item.value);
        }
        if (!checkType) {
          acc[item.name] = item.value;
        }
        break;
      case ParameterType.Bool:
        if (item.value) {
          acc[item.name] = item.value === 'true';
        }
        if (!checkType) {
          acc[item.name] = item.value;
        }
        break;
      case ParameterType.Object:
        if (item.sub_parameters) {
          const obj = transformTreeToObj(item.sub_parameters, checkType);
          if (!isEmpty(obj)) {
            acc[item.name] = obj;
          }
        }
        break;
      case ParameterType.Array:
        /**
         * If it is an array, you need to filter out empty items (and the children of the array are not object and array).
         * Here, use temp to receive the filtered sub-items to avoid directly modifying the original array (because the original array and page data are bound, empty items cannot be directly deleted)
         */
        arrTemp = item.sub_parameters;
        if (
          [
            ParameterType.Bool,
            ParameterType.Integer,
            ParameterType.Number,
            ParameterType.String,
          ].includes(item.sub_parameters[0].type)
        ) {
          arrTemp = item.sub_parameters.filter((subItem: any) => subItem.value);
        }
        if (isEmpty(arrTemp)) {
          break;
        }
        acc[item.name] = arrTemp.map((subItem: any) => {
          // Boolean type matching string true/false
          if ([ParameterType.Bool].includes(subItem.type)) {
            return checkType ? subItem.value === 'true' : subItem.value;
          }
          // Number type to number
          if (
            [ParameterType.Integer, ParameterType.Number].includes(subItem.type)
          ) {
            return checkType ? Number(subItem.value) : subItem.value;
          }
          // The string type is returned directly (the array entered here is already an array of filtered null values)
          if ([ParameterType.String].includes(subItem.type)) {
            return subItem.value;
          }
          // If it is an object, recursive traversal
          if (subItem.type === ParameterType.Object) {
            return transformTreeToObj(subItem.sub_parameters, checkType);
          }
        });
        break;
      default:
        break;
    }
    return acc;
  }, {});

// Clone the node, modify the key and clear the value
export const cloneWithRandomKey = (obj: any) => {
  // Create a new object stored value
  const clone: any = {};

  // Iterate through all properties of the original object
  for (const prop in obj) {
    // If this property of the original object is an object, recursively call the cloneWithRandomKey function
    if (obj[prop]?.constructor === Object) {
      clone[prop] = cloneWithRandomKey(obj[prop]);
    } else {
      // Otherwise, copy this property directly
      clone[prop] = obj[prop];
    }
  }

  // If this object has sub_parameters properties, you need to iterate over it
  if ('sub_parameters' in clone) {
    clone.sub_parameters = clone.sub_parameters?.map(cloneWithRandomKey);
  }

  // Generate a new random key
  if (clone[ROWKEY]) {
    clone[ROWKEY] = nanoid();
  }
  if (clone.value) {
    clone.value = null;
  }

  // Returns the cloned object
  return clone;
};
// To determine whether the parameter shows the delete button, first determine whether it is the root node, and the root node allows deletion.
export const handleIsShowDelete = (
  data: any,
  targetKey: string | undefined,
) => {
  const rootIds = data.map((d: any) => d[ROWKEY]);
  if (rootIds.includes(targetKey)) {
    return true;
  }
  return isShowDelete(data, targetKey);
};

// Check if the same name exists
export const checkSameName = (
  data: Array<APIParameter>,
  targetKey: string,
  val: string,
): boolean | undefined => {
  for (const item of data) {
    if (item[ROWKEY] === targetKey) {
      const items = data.filter(
        (dataItem: APIParameter) => dataItem.name === val,
      );
      return items.length > 1;
    } else if (
      Array.isArray(item[childrenRecordName]) &&
      item[childrenRecordName].length > 0
    ) {
      if (checkSameName(item[childrenRecordName], targetKey, val)) {
        return true;
      }
    }
  }
};

// Check if there is an array type (used to determine whether the response requires an operation column)
export const checkHasArray = (data: unknown) => {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const item of data) {
    if (item.type === ParameterType.Array) {
      return true;
    } else if (
      Array.isArray(item[childrenRecordName]) &&
      item[childrenRecordName].length > 0
    ) {
      // Adjustment, loop exit timing
      if (checkHasArray(item[childrenRecordName])) {
        return true;
      }
    }
  }
  return false;
};

// Determine whether the parameter shows the delete button (the last one of the object type is not allowed to be deleted)
export const isShowDelete = (data: any, targetKey: string | undefined) => {
  for (const item of data) {
    if (item[ROWKEY] === targetKey) {
      return data.length > 1;
    } else if (
      Array.isArray(item[childrenRecordName]) &&
      item[childrenRecordName].length > 0
    ) {
      if (isShowDelete(item[childrenRecordName], targetKey)) {
        return true;
      }
    }
  }
};

export const sleep = (time: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, time);
  });

// This method is compatible with Chrome, Arch, Safari and iPad, and is compatible with Firefox.
export const scrollToErrorElement = (className: string) => {
  const errorElement = document.querySelector(className);
  if (errorElement) {
    if (typeof (errorElement as any).scrollIntoViewIfNeeded === 'function') {
      (errorElement as any).scrollIntoViewIfNeeded();
    } else {
      // Compatibility handling, such as Firefox
      errorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
};

export const scrollToBottom = (ele: Element) => {
  const scrollEle = ele;
  scrollEle.scrollTo({
    left: 0,
    top: scrollEle.scrollHeight,
    behavior: 'smooth',
  });
};

export const initParamsDefault = (
  data: Array<APIParameter>,
  keyDefault: 'global_default' | 'local_default',
) => {
  const result = cloneDeep(data);
  const init = (obj: APIParameter) => {
    if (keyDefault === 'local_default' && !has(obj, 'local_default')) {
      obj[keyDefault] = obj.global_default;
    }
    if (!obj[keyDefault]) {
      obj[keyDefault] = '';
    }
    // bot non-reference + required + local default value is empty + invisible, it is an abnormal scene and needs to be manually dialed
    const isUnusual =
      obj.default_param_source === DefaultParamSource.Input &&
      keyDefault === 'local_default' &&
      obj.is_required &&
      !obj.local_default &&
      obj.local_disable;

    if (isUnusual) {
      obj.local_disable = false;
    }
  };

  const addDefault = (res: Array<APIParameter>, isArray = false) => {
    for (let i = 0, len = res.length; i < len; i++) {
      const obj = res[i];
      if (isArray) {
        obj[keyDefault] = undefined;
        if (obj.sub_parameters && obj.sub_parameters.length > 0) {
          addDefault(obj.sub_parameters, true);
        }
      } else if (obj.type === ParameterType.Array) {
        init(obj);
        if (obj.sub_parameters && obj.sub_parameters.length > 0) {
          addDefault(obj.sub_parameters, true);
        }
      } else {
        if (obj.type === ParameterType.Object) {
          obj[keyDefault] = undefined;
        } else {
          init(obj);
        }
        if (obj.sub_parameters && obj.sub_parameters.length > 0) {
          addDefault(obj.sub_parameters);
        }
      }
    }
  };
  addDefault(result);
  return result;
};

// @ts-expect-error -- linter-disable-autofix
export const transformArrayToTree = (array, template: Array<APIParameter>) => {
  const arrObj = array;
  const tree: Array<APIParameter> = [];

  if (Array.isArray(arrObj)) {
    arrObj.forEach(item => {
      const subTree = createSubTree(item, template[0]);
      tree.push(subTree);
    });
  }

  return tree;
};

const createSubTree = (arrItem: any, tem: any) => {
  let subTree: APIParameter & { value?: unknown } = {};
  // array
  if (Array.isArray(arrItem)) {
    subTree = {
      ...tem,
      id: nanoid(),
      sub_parameters: [],
    };
    arrItem.forEach(item => {
      const arrItemSubTree = createSubTree(item, tem.sub_parameters[0]);
      subTree.sub_parameters?.push(arrItemSubTree);
    });
  } else if (isObject(arrItem)) {
    subTree = {
      ...tem,
      id: nanoid(),
      sub_parameters: [],
    };
    let childTree: APIParameter & { value?: unknown } = {};
    Object.keys(arrItem).map(key => {
      if (Object.prototype.hasOwnProperty.call(arrItem, key)) {
        // @ts-expect-error -- linter-disable-autofix
        const value = arrItem[key];

        if (Array.isArray(value) || typeof value === 'object') {
          const nestedSubTree = createSubTree(
            value,
            // @ts-expect-error -- linter-disable-autofix
            tem.sub_parameters.find(item => item.name === key),
          );
          subTree.sub_parameters?.push(nestedSubTree);
        } else {
          childTree = {
            // @ts-expect-error -- linter-disable-autofix
            ...tem.sub_parameters.find(item => item.name === key),
            id: nanoid(),
            sub_parameters: [],
          };
          childTree.value = String(value);
          subTree.sub_parameters?.push(childTree);
        }
      }
    });
  } else {
    subTree = {
      ...tem,
      id: nanoid(),
      sub_parameters: [],
    };
    subTree.value = String(arrItem);
  }

  return subTree;
};

export const transformParamsToTree = (params: Array<APIParameter>) => {
  const result = cloneDeep(params);
  for (let i = 0, len = result.length; i < len; i++) {
    if (result[i].type === ParameterType.Array) {
      const arr = JSON.parse(result[i].global_default || '[]');
      if (arr.length > 0) {
        const tree = transformArrayToTree(arr, result[i].sub_parameters || []);
        result[i].sub_parameters = tree;
      }
    } else {
      // There is a problem with the object embedded array, it is overwritten and needs to be reset.
      result[i].sub_parameters = transformParamsToTree(
        result[i].sub_parameters || [],
      );
    }
  }
  return result;
};
// Data extra processing/If there is no global_default === undefined, set global_disable is also undefined, and finally set all global_default to undefined
export const doRemoveDefaultFromResponseParams = (
  data: APIParameter[],
  hasRequired = false,
) => {
  if (!data.length) {
    return [];
  }
  const returnData = cloneDeep(data);

  for (let i = 0, len = returnData.length; i < len; i++) {
    const current = returnData[i];

    if (current.global_default === undefined) {
      current.global_disable = undefined;
    }

    current.global_default = undefined;
    if (!hasRequired) {
      current.is_required = undefined;
    }
    current.sub_parameters = doRemoveDefaultFromResponseParams(
      current.sub_parameters ?? [],
      hasRequired,
    );
  }

  return returnData;
};

// @ts-expect-error -- linter-disable-autofix
export const doValidParams = (
  params: APIParameter[],
  targetKey: keyof APIParameter,
) => {
  if (!params?.length || !targetKey) {
    return !!0;
  }

  for (let i = 0, j = params.length; i < j; i++) {
    const target = params[i];

    if (!target[targetKey]) {
      return !!0;
    }

    // @ts-expect-error -- linter-disable-autofix
    if (target.sub_parameters.length > 0) {
      // @ts-expect-error -- linter-disable-autofix
      const sub = doValidParams(target.sub_parameters, targetKey);

      if (sub === !!0) {
        return sub;
      }
    }
  }

  return !0;
};
