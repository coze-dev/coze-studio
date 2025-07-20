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
 
/* eslint-disable @typescript-eslint/naming-convention */
import {
  ViewVariableType,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';

// 不同类型的 meta 生成 json 的默认值
const getDefaultValue = (type: ViewVariableType) => {
  let rs;
  switch (type) {
    case ViewVariableType.String:
      rs = '';
      break;
    case ViewVariableType.Integer:
      rs = 0;
      break;
    case ViewVariableType.Boolean:
      rs = false;
      break;
    case ViewVariableType.Number:
      rs = 0;
      break;
    case ViewVariableType.ArrayString:
      rs = [];
      break;
    case ViewVariableType.ArrayInteger:
      rs = [];
      break;
    case ViewVariableType.ArrayBoolean:
      rs = [];
      break;
    case ViewVariableType.ArrayNumber:
      rs = [];
      break;
    case ViewVariableType.ArrayObject:
      rs = [{}];
      break;
    case ViewVariableType.Image:
      rs = '';
      break;
    case ViewVariableType.ArrayImage:
      rs = [];
      break;
    case ViewVariableType.Object:
      rs = {};
      break;
    default:
      rs = '';
      break;
  }
  return rs;
};
// {
//   [ViewVariableType.String]: '',
//   [ViewVariableType.Integer]: 0,
//   [ViewVariableType.Boolean]: false,
//   [ViewVariableType.Number]: 0,
//   [ViewVariableType.ArrayString]: [],
//   [ViewVariableType.ArrayInteger]: [],
//   [ViewVariableType.ArrayBoolean]: [],
//   [ViewVariableType.ArrayNumber]: [],
//   [ViewVariableType.ArrayObject]: [{}],
//   [ViewVariableType.Object]: {},
//   [ViewVariableType.Image]: '',
//   [ViewVariableType.ArrayImage]: [],
// };

// 根据 meta 生成默认 json
export const metaToJSON = (meta: ViewVariableTreeNode, obj?: object) => {
  const { type, name, children } = meta;
  if (!obj) {
    obj = {};
  }

  if (type === ViewVariableType.Object) {
    const subObj = {};
    obj[name] = subObj;
    children?.forEach(c => {
      metaToJSON(c, subObj);
    });
  } else if (type === ViewVariableType.ArrayObject) {
    const subObj = {};
    obj[name] = [subObj];
    children?.forEach(c => {
      metaToJSON(c, subObj);
    });
  } else {
    obj[name] = getDefaultValue(type);
  }
  return obj;
};

// 根据 metas 生成 json
export const metasToJSON = (metas?: ViewVariableTreeNode[]): object =>
  metas ? Object.assign({}, ...metas.map(meta => metaToJSON(meta))) : {};

type ViewVariableArrayNode = ViewVariableTreeNode & {
  parent?: ViewVariableArrayNode;
  level: number;
};

// metas tree -> array
export const metasFlat = (
  metas?: ViewVariableTreeNode[],
): ViewVariableArrayNode[] => {
  const treeToArray = (
    meta: ViewVariableTreeNode,
    parent?: ViewVariableTreeNode,
    level = 0,
  ) => {
    const { children } = meta;
    const thisMeta = { ...meta, parent, level };
    return [
      thisMeta,
      ...(children?.map(c => treeToArray(c, thisMeta, level + 1)) || []).flat(),
    ];
  };
  return metas && metas.length > 0 ? metas.map(m => treeToArray(m)).flat() : [];
};

// export const findLeafMeta = (meta: ViewVariableTreeNode) => {
//   const traverse = m => {
//     if (m.children?.length > 0) {
//       return [...m.children.map(traverse).flat()];
//     }
//     return m;
//   };

//   return {
//     leaves: traverse(meta),
//     hasLeaf: (meta?.children?.length ?? 0) > 0,
//   };
// };

// 比较新旧 meta ，找出 removed、retyped、renamed、added
export const compareMetas = (
  newMetas: ViewVariableTreeNode[] | undefined = [],
  oldMetas: ViewVariableTreeNode[] | undefined = [],
): {
  removed: ViewVariableArrayNode[];
  retyped: {
    from: ViewVariableArrayNode;
    to: ViewVariableArrayNode;
  }[];
  renamed: {
    from: ViewVariableArrayNode;
    to: ViewVariableArrayNode;
  }[];
  added: ViewVariableArrayNode[];
} => {
  const newMetasArray = metasFlat(newMetas);
  const oldMetasArray = metasFlat(oldMetas);

  const removed: ViewVariableArrayNode[] = [];
  const retyped: {
    from: ViewVariableArrayNode;
    to: ViewVariableArrayNode;
  }[] = [];

  const renamed: {
    from: ViewVariableArrayNode;
    to: ViewVariableArrayNode;
  }[] = [];

  const oldKeys = {};

  oldMetasArray.forEach(oldMeta => {
    oldKeys[oldMeta.key] = true;
    const newMeta = newMetasArray.find(o => o.key === oldMeta.key);
    // 被删掉
    if (!newMeta) {
      removed.push(oldMeta);
    } else if (oldMeta.name !== newMeta.name) {
      renamed.push({
        from: oldMeta,
        to: newMeta,
      });
    } else if (oldMeta.type !== newMeta.type) {
      retyped.push({
        from: oldMeta,
        to: newMeta,
      });
    }
  });
  // 不在 oldKeys 中即为新增，没名字的也不用管
  const added = newMetasArray
    .filter(d => d.key && !oldKeys[d.key])
    .filter(d => d.name);

  return {
    removed,
    renamed,
    retyped,
    added,
  };
};

// 根据 meta.parent ，补齐路径 parent1 -> parent2 ... -> self
const getMetaPath = (_meta: ViewVariableArrayNode): ViewVariableArrayNode[] => {
  if (_meta.parent) {
    return [...getMetaPath(_meta.parent), _meta];
  }
  return [_meta];
};

/**
 * 根据路径返回 obj 内的所有引用点位
 * */
const getObjRefByMetaPath = (
  _metaPath: ViewVariableArrayNode[],
  _obj: object,
) => {
  let it = [_obj];
  _metaPath.forEach(_meta => {
    it = it
      .map(_it => {
        if (_meta.type === ViewVariableType.Object) {
          if (!_it[_meta.name]) {
            _it[_meta.name] = {};
          }
          return [_it[_meta.name]];
        } else if (_meta.type === ViewVariableType.ArrayObject) {
          if (!_it[_meta.name]) {
            _it[_meta.name] = [{}];
          }
          return _it[_meta.name];
        }
      })
      .flat();
  });

  return it;
};

/**
 *  根据 metas 变化，精准修改 json
 * */
// eslint-disable-next-line max-lines-per-function
export const niceAssign = (
  json?: string,
  newMetas: ViewVariableTreeNode[] | undefined = [],
  oldMetas: ViewVariableTreeNode[] | undefined = [],
): string | undefined => {
  if (!json) {
    return json;
  }

  try {
    const _json = JSON.parse(json);

    const { removed, renamed, retyped, added } = compareMetas(
      newMetas,
      oldMetas,
    );

    /**
     * 重命名需要做什么？
     * 1. 找出所有 fromRefs
     * 2. 找出所有 toRefs
     * 3. 将 fromRefs 一一对应赋值给 toRefs，默认值兜底
     * 4. 将 fromRefs 添加到 removed
     * */
    renamed
      // 需要从子 -> 父逐级改名，否则父节点先变动会导致子节点找不到
      .sort((a, b) => b.from.level - a.from.level)
      .forEach(_renameMeta => {
        const fromMetaPath = getMetaPath(_renameMeta.from);
        const fromRefs = getObjRefByMetaPath(
          fromMetaPath.splice(0, fromMetaPath.length - 1),
          _json,
        );

        fromRefs.forEach(ref => {
          ref[_renameMeta.to.name] =
            ref[_renameMeta.from.name] ?? getDefaultValue(_renameMeta.to.type);
          // const sortedKeys = Object.keys(ref).sort();
          // sortedKeys.forEach(k => {
          //   const cache = ref[k];
          //   delete ref[k];
          //   ref[k] = cache;
          // });
        });

        removed.push(_renameMeta.from);
      });

    /**
     * 删除需要做什么？
     * 1. 根据 refs 将对应的值设置为 undefined 即可，JSON.stringify 时自动过滤
     * */
    removed
      // 需要从子 -> 父逐级删除，否则父节点删除会导致子节点找不到。（好像也先删父节点也没啥问题，保险起见从子节点开删吧）
      .sort((a, b) => b.level - a.level)
      .forEach(_removeMeta => {
        const removeMetaPath = getMetaPath(_removeMeta);
        const removeRefs = getObjRefByMetaPath(
          removeMetaPath.splice(0, removeMetaPath.length - 1),
          _json,
        );

        removeRefs.forEach(ref => {
          ref[_removeMeta.name] = undefined;
        });
      });

    /**
     * 类型改变需要做什么？
     * 1. 根据 toRefs ，将对应的值重置为默认值
     * 2. 特化一: ArrayObject 转 Object，不能重置为默认值。预期：取 array[0] [{a:1},{a:2}] -> {a:1} (默认值兜底)
     * 3. 特化二: Object 转 ArrayObject，不能重置为默认值。预期：包一层数组 [] {a:1} -> [{a:1}]
     * */
    retyped
      // 需要从子 -> 父逐级修改，否则父节点先变动会导致子节点找不到
      .sort((a, b) => b.from.level - a.from.level)
      .forEach(_retypedMeta => {
        const { from, to } = _retypedMeta;
        /**
         * 特化逻辑一：arrayObject 转 object
         * 预期：取 array[0] [{a:1},{a:2}] -> {a:1}
         */
        if (
          from.type === ViewVariableType.ArrayObject &&
          to.type === ViewVariableType.Object
        ) {
          const toMetaPath = getMetaPath(to);
          const toRefs = getObjRefByMetaPath(
            toMetaPath.splice(0, toMetaPath.length - 1),
            _json,
          );
          toRefs.forEach(ref => {
            ref[to.name] = ref[to.name]?.[0] ?? getDefaultValue(to.type);
          });
          /**
           * 特化逻辑二：object 转 arrayObject
           * 预期：套一层 [] {a:1} -> [{a:1}]
           */
        } else if (
          from.type === ViewVariableType.Object &&
          to.type === ViewVariableType.ArrayObject
        ) {
          const toMetaPath = getMetaPath(to);
          const toRefs = getObjRefByMetaPath(
            toMetaPath.splice(0, toMetaPath.length - 1),
            _json,
          );

          toRefs.forEach(ref => {
            ref[to.name] = [ref[to.name]];
          });

          /**
           * 多数情况，直接根据新类型重置为新类型对应的默认值即可
           */
        } else {
          const toMetaPath = getMetaPath(to);
          const toRefs = getObjRefByMetaPath(
            toMetaPath.splice(0, toMetaPath.length - 1),
            _json,
          );

          toRefs.forEach(ref => {
            ref[to.name] = getDefaultValue(to.type);
          });
        }
      });

    /**
     * 新增需要做什么？
     * 1. 根据 refs 将对应的值设置为默认值
     * */
    added
      // 需要从父 -> 子逐级添加，否则子节点找不到父节点
      .sort((a, b) => a.level - b.level)
      .forEach(newMeta => {
        const newMetaPath = getMetaPath(newMeta);
        const newRefs = getObjRefByMetaPath(
          newMetaPath.splice(0, newMetaPath.length - 1),
          _json,
        );

        newRefs.forEach(ref => {
          ref[newMeta.name] = getDefaultValue(newMeta.type);
          // const sortedKeys = Object.keys(ref).sort();
          // sortedKeys.forEach(k => {
          //   const cache = ref[k];
          //   delete ref[k];
          //   ref[k] = cache;
          // });
        });
      });

    return JSON.stringify(_json, null, 4);
  } catch (error) {
    console.error(error);
    return json;
  }
};

/**
 * 目前使用 JSON.stringify 对 json 做格式化，给未来更好的格式化留个口子
 */
export const jsonFormat = json => {
  try {
    return JSON.stringify(json, null, 4);
  } catch (error) {
    console.error(error);
    return json;
  }
};

// 校验 output 中是否有重名 key
export const outputsVerify = (outputs?: ViewVariableTreeNode[]): boolean => {
  if (!outputs) {
    return false;
  }

  let rs = true;
  const names = outputs.map(o => o.name);
  const namesSet = new Set(names);
  if (names.length !== namesSet.size) {
    rs = false;
  } else {
    for (const d of outputs) {
      if (d.children) {
        rs = outputsVerify(d.children);
        if (!rs) {
          break;
        }
      }
    }
  }

  return rs;
};
