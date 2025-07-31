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

import { cloneDeep } from 'lodash-es';
import { type ILevelSegment } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';

import { type LevelDocumentTree } from '../types';

export const getTreeNodes = (
  segments: ILevelSegment[],
): LevelDocumentTree[] => {
  const root = segments.find(f => f.parent === -1 && f.type === 'title');

  if (!root) {
    return segments.map(item => ({
      ...item,
      id: item.id.toString(),
      parent: item.parent?.toString(),
      children: [],
    }));
  }

  return [
    {
      ...root,
      id: root.id?.toString(),
      parent: root.parent?.toString(),
      children: getChildren(root, segments),
    },
  ];
};

/** Segments to TreeNodes */
const getChildren = (
  target: ILevelSegment,
  list: ILevelSegment[],
): LevelDocumentTree[] =>
  (target.children ?? []).reduce<LevelDocumentTree[]>((acc, cur) => {
    const found = list.find(f => f.id === cur);
    if (found) {
      return [
        ...acc,
        {
          ...found,
          id: found.id?.toString(),
          parent: found.parent?.toString(),
          children: getChildren(found, list),
        },
      ];
    } else {
      return [...acc];
    }
  }, []);

/**TreeNodes related */
export const findDescendantIDs = (node: LevelDocumentTree) => {
  const ids = new Set<string>();
  const findChild = (item: LevelDocumentTree) => {
    if (!item || !item.id) {
      return;
    }
    const { children } = item;
    if (children && children.length) {
      children.forEach(child => {
        if (child && child.id) {
          ids.add(child.id);
          findChild(child);
        }
      });
    }
  };
  findChild(node);
  return ids;
};

export const findTreeNodeByID = (
  nodes: LevelDocumentTree[],
  id: string,
): LevelDocumentTree | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findTreeNodeByID(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const handleTreeNodeMove = (
  positions: { dragIDs: string[]; parentID: string | null; dropIndex: number },
  segments: ILevelSegment[],
): {
  segments: ILevelSegment[] | null;
  errMsg: string | null;
} => {
  if (positions.parentID === null) {
    return {
      segments: null,
      errMsg: I18n.t('knowledge_hierarchies_categories_01'),
    };
  }
  const resSegments = cloneDeep(segments);
  for (const id of positions.dragIDs) {
    const dragSegmentIdx = resSegments.findIndex(
      segment => segment.id.toString() === id,
    );

    if (dragSegmentIdx === -1) {
      continue;
    }

    const dragSegment = resSegments[dragSegmentIdx];
    const parentSegment = resSegments.find(
      segment => segment.id.toString() === positions.parentID,
    );

    if (!parentSegment) {
      return {
        segments: null,
        errMsg: I18n.t('knowledge_hierarchies_categories_02'),
      };
    }

    // If it is the same parent and the dragged position is before the current position, the dropIndex is reduced by 1.
    const originalIndex = parentSegment.children.indexOf(dragSegment.id);
    const dropIndex =
      originalIndex < positions.dropIndex &&
      dragSegment.parent === parentSegment.id
        ? positions.dropIndex - 1
        : positions.dropIndex;

    if (dragSegment.parent !== parentSegment.id) {
      // Remove from old parent's children
      const oldParent = resSegments.find(s => s.id === dragSegment.parent);
      oldParent?.children.splice(oldParent.children.indexOf(dragSegment.id), 1);
      dragSegment.parent = parentSegment.id;
    }

    // Reorder in parent's children
    parentSegment.children = parentSegment.children.filter(
      child => child !== dragSegment.id,
    );
    parentSegment.children.splice(dropIndex, 0, dragSegment.id);
  }

  return {
    segments: resSegments,
    errMsg: null,
  };
};

export const handleDeleteNode = (ids: string[], segments: ILevelSegment[]) => {
  const resSegments = cloneDeep(segments);
  for (const id of ids) {
    const index = resSegments.findIndex(item => item.id.toString() === id);
    const parentSegment = resSegments.find(
      item => item.id === resSegments[index].parent,
    );
    if (parentSegment) {
      parentSegment.children = parentSegment.children.filter(
        item => item !== resSegments[index].id,
      );
    }
    resSegments.splice(index, 1);
  }
  return resSegments;
};

export const handleMergeNodes = (
  id: string,
  descendants: string[],
  segments: ILevelSegment[],
): {
  segments: ILevelSegment[] | null;
  errMsg: string | null;
} => {
  const resSegments = cloneDeep(segments);
  const mergedSegment = resSegments.find(item => item.id.toString() === id);

  if (!mergedSegment) {
    return {
      segments: null,
      errMsg: I18n.t('knowledge_hierarchies_categories_03'),
    };
  }

  if (mergedSegment.parent === -1 && mergedSegment.type === 'title') {
    return {
      segments: null,
      errMsg: I18n.t('knowledge_hierarchies_categories_03'),
    };
  }

  mergedSegment.children = [];
  mergedSegment.type = 'section-text';

  for (const descendant of descendants) {
    const segmentToMerge = resSegments.find(
      item => item.id.toString() === descendant,
    );
    if (!segmentToMerge) {
      return {
        segments: null,
        errMsg: I18n.t('knowledge_hierarchies_categories_04'),
      };
    }

    // Remove the node from the children of the original parent
    const parentSegment = resSegments.find(
      item => item.id === segmentToMerge.parent,
    );
    if (parentSegment) {
      parentSegment.children = parentSegment.children.filter(
        childId => childId !== segmentToMerge.id,
      );
    }

    if (!['table', 'image', 'title'].includes(segmentToMerge?.type ?? '')) {
      // Merge text content and delete nodes
      mergedSegment.text += segmentToMerge.text;
      const index = resSegments.findIndex(
        item => item.id === segmentToMerge.id,
      );
      if (index !== -1) {
        resSegments.splice(index, 1);
      }
    } else {
      // Nodes of type non-section-text, move them to the children of the merged node
      segmentToMerge.parent = mergedSegment.id;
      mergedSegment.children.push(segmentToMerge.id);
    }
  }

  return {
    segments: resSegments,
    errMsg: null,
  };
};
