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

// Different types of meta generate default values for JSON
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

// Generate default json according to meta
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

// Generate JSON from metas
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

// Compare old and new metas to find removed, retyped, renamed, added
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
    // deleted
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
  // If it is not in oldKeys, it is a new addition. Don't worry if it has no name.
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

// According to meta.parent, complete the path parent1 - > parent2... - > self
const getMetaPath = (_meta: ViewVariableArrayNode): ViewVariableArrayNode[] => {
  if (_meta.parent) {
    return [...getMetaPath(_meta.parent), _meta];
  }
  return [_meta];
};

/**
 * Returns all reference points within obj according to the path
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
 *  Accurately modify json according to metas changes
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
     * What do I need to do to rename?
     * 1. Find all fromRefs
     * 2. Find all toRefs
     * 3. Assign fromRefs to toRefs one-to-one, and the default value is the bottom.
     * 4. Add fromRefs to removed
     * */
    renamed
      // You need to change the name from the child - > parent step by step, otherwise the parent node will change first and the sub-node will not be found.
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
     * What does it take to delete?
     * 1. Set the corresponding value to undefined according to refs, and automatically filter when JSON.stringify
     * */
    removed
      // You need to delete it step by step from the child - > parent, otherwise the deletion of the parent node will cause the sub-node to not be found. (It seems that it is no problem to delete the parent node first, just delete it from the sub-node to be on the safe side)
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
     * What do I need to do to change the type?
     * 1. According to toRefs, reset the corresponding value to the default value
     * 2. Specialization 1: ArrayObject to Object, cannot be reset to the default value. Expected: take array [0] [{a: 1}, {a: 2 }] -> { a: 1} (default value to cover the bottom)
     * 3. Specialization 2: Object to ArrayObject, cannot be reset to the default value. Expected: wrap a layer of array [] {a: 1 } -> [{ a: 1}]
     * */
    retyped
      // You need to modify it step by step from child - > parent, otherwise changing the parent node first will cause the sub-node to not be found.
      .sort((a, b) => b.from.level - a.from.level)
      .forEach(_retypedMeta => {
        const { from, to } = _retypedMeta;
        /**
         * Specialized logic 1: arrayObject to object
         * Expected: take array [0] [{a: 1}, {a: 2 }] -> { a: 1}
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
           * Specialization logic 2: object to arrayObject
           * Expectations: a layer [] {a: 1 } -> [{ a: 1}]
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
           * In most cases, you can directly reset to the default value corresponding to the new type according to the new type.
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
     * What do I need to add?
     * 1. Set the corresponding value to the default value according to refs
     * */
    added
      // You need to add it level by level from Parent - > Child, otherwise the sub-node cannot find the parent node.
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
 * JSON.stringify is currently used to format JSON, leaving room for better formatting in the future
 */
export const jsonFormat = json => {
  try {
    return JSON.stringify(json, null, 4);
  } catch (error) {
    console.error(error);
    return json;
  }
};

// Check if there is a duplicate key in the output
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
