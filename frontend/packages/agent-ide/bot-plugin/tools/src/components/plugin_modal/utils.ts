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
/* eslint-disable @typescript-eslint/no-explicit-any -- 一些历史any 改不动 */
import { nanoid } from 'nanoid';
import { cloneDeep, has, isEmpty, isNumber, isObject } from 'lodash-es';
import {
  type APIParameter,
  ParameterLocation,
  ParameterType,
  DefaultParamSource,
} from '@coze-arch/bot-api/plugin_develop';

import { ARRAYTAG, ROWKEY, childrenRecordName } from './config';

// 遍历树，返回目标id路径
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

// 给每层对象增加层级深度标识
export const addDepthAndValue = (
  tree: any,
  valKey: 'global_default' | 'local_default' = 'global_default',
  depth = 1,
) => {
  if (!Array.isArray(tree)) {
    return;
  }
  // 遍历树中的每个节点
  for (const node of tree) {
    // 为当前节点添加深度标识符
    node.deep = depth;
    if (node[valKey]) {
      node.value = node[valKey];
    }
    // 如果当前节点有子节点，则递归地为子节点添加深度标识符
    if (node[childrenRecordName]) {
      addDepthAndValue(node[childrenRecordName], valKey, depth + 1);
    }
  }
};

// 将深度信息push到一个数组里，最后取最大值
export const handleDeepArr = (tree: any, deepArr: Array<number> = []) => {
  if (!Array.isArray(tree)) {
    return;
  }
  // 遍历树中的每个节点
  for (const node of tree) {
    // 为当前节点添加深度标识符
    if (isNumber(node.deep)) {
      deepArr.push(node.deep);
    }

    if (node[childrenRecordName]) {
      handleDeepArr(node[childrenRecordName], deepArr);
    }
  }
};

// 返回最大深度
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

// 默认子节点
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

// 删除当前节点
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

// 删除全部子节点
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
  /** 数组的子节点是否需要继承父节点的字段值，当前只有可见性开关需要继承 */
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

// 更新节点信息
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

// 根据路径找对应模版值
export const findTemplateNodeByPath = (
  dsl: any,
  path: Array<string | number>,
) => {
  let node = cloneDeep(dsl);
  const newPath = [...path]; //创建新的路径，避免修改原路径
  for (let i = 0; i < path.length; i++) {
    // 如果存在节点，说明是源数据节点上增加子节点
    if (node[path[i]]) {
      node = node[path[i]];
    } else {
      // 如果不存在，说明是新增的节点增加子节点，这时需要将路径指向原始节点（第一个节点）
      node = node[0];
      newPath[i] = 0;
    }
  }
  return newPath;
};

// 树转换成对象
export const transformTreeToObj = (tree: any, checkType = true): any =>
  // 树的每一层级表示一个对象的属性集

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
         * 如果是数组，需要过滤掉空的项（且数组的子项非object和array）
         * 这里用temp接收过滤后的子项，避免直接修改原数组（因为原数组和页面数据绑定，不能直接删除空项）
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
          // boolean类型匹配字符串true/false
          if ([ParameterType.Bool].includes(subItem.type)) {
            return checkType ? subItem.value === 'true' : subItem.value;
          }
          // 数字类型转为number
          if (
            [ParameterType.Integer, ParameterType.Number].includes(subItem.type)
          ) {
            return checkType ? Number(subItem.value) : subItem.value;
          }
          // 字符串类型直接返回（进到这里的已经是过滤完空值的数组）
          if ([ParameterType.String].includes(subItem.type)) {
            return subItem.value;
          }
          // 如果是对象，递归遍历
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

// 克隆节点，修改key及清空value
export const cloneWithRandomKey = (obj: any) => {
  // 创建新对象储存值
  const clone: any = {};

  // 遍历原对象的所有属性
  for (const prop in obj) {
    // 如果原对象的这个属性是一个对象，递归调用 cloneWithRandomKey 函数
    if (obj[prop]?.constructor === Object) {
      clone[prop] = cloneWithRandomKey(obj[prop]);
    } else {
      // 否则，直接复制这个属性
      clone[prop] = obj[prop];
    }
  }

  // 如果这个对象有 sub_parameters 属性，需要遍历它
  if ('sub_parameters' in clone) {
    clone.sub_parameters = clone.sub_parameters?.map(cloneWithRandomKey);
  }

  // 生成一个新的随机 key
  if (clone[ROWKEY]) {
    clone[ROWKEY] = nanoid();
  }
  if (clone.value) {
    clone.value = null;
  }

  // 返回克隆的对象
  return clone;
};
// 判断参数是否显示删除按钮 先判断是否是根节点，根节点允许删除
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

// 检查是否存在相同名称
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

// 检查是否有array类型（用来判断response是否需要操作列）
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
      // 调整 循环退出时机
      if (checkHasArray(item[childrenRecordName])) {
        return true;
      }
    }
  }
  return false;
};

// 判断参数是否显示删除按钮（object类型最后一个不允许删除）
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

// 该方法兼容chrome、Arch、Safari浏览器及iPad，增加兼容firefox
export const scrollToErrorElement = (className: string) => {
  const errorElement = document.querySelector(className);
  if (errorElement) {
    if (typeof (errorElement as any).scrollIntoViewIfNeeded === 'function') {
      (errorElement as any).scrollIntoViewIfNeeded();
    } else {
      // 兼容性处理，如 Firefox
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
    // bot非引用+必填+local默认值为空+不可见，是异常场景，需手动拨正
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
  // 数组
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
      // 对象嵌数组有问题 被覆盖了 需要重置
      result[i].sub_parameters = transformParamsToTree(
        result[i].sub_parameters || [],
      );
    }
  }
  return result;
};
// data 额外加工 / 如果本身没有 global_default === undefined 就设置 global_disable 也是 undefined，最后将所有的 global_default 设置成 undefined
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
