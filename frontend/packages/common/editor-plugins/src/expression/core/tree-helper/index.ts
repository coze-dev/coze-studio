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

/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
  ExpressionEditorTreeNode,
  ExpressionEditorSegment,
  Variable,
} from '../type';
import { ExpressionEditorSegmentType } from '../constant';
import { ViewVariableType, isArrayType } from '../../variable-types';

export namespace ExpressionEditorTreeHelper {
  export interface AvailableVariable {
    name: string;
    keyPath?: string[];
    variable?: Variable;
  }

  export const pruning = (params: {
    tree: ExpressionEditorTreeNode[];
    segments: ExpressionEditorSegment[];
  }): ExpressionEditorTreeNode[] => {
    const { tree, segments } = params;
    if (segments.length === 0) {
      return tree;
    }
    const lastSegment = segments[segments.length - 1];
    const segmentsRemovedLast =
      lastSegment.type === ExpressionEditorSegmentType.ArrayIndex
        ? segments.slice(0, segments.length - 2) // The array index belongs to the previous level, and two layers need to be removed.
        : segments.slice(0, segments.length - 1);
    let treeLayer = tree;
    segmentsRemovedLast.forEach(segment => {
      if (segment.type !== ExpressionEditorSegmentType.ObjectKey) {
        return;
      }
      const treeChildren = treeLayer.filter(
        node => node.label === segment.objectKey,
      );
      // Compatible variable names are duplicated, but the subfields are different
      if (treeChildren?.length) {
        treeLayer = treeChildren.reduce(
          (pre: ExpressionEditorTreeNode[], cur: ExpressionEditorTreeNode) => {
            if (cur.children?.length) {
              return [...pre, ...cur.children];
            }
            return pre;
          },
          [],
        );
      } else {
        treeLayer = [];
      }
    });
    return treeLayer;
  };

  export const concatFullPath = (params: {
    node: ExpressionEditorTreeNode;
    segments: ExpressionEditorSegment[];
  }): string => {
    const { node, segments } = params;
    let current: ExpressionEditorTreeNode | undefined = node;
    const pathList: { objectKey: string; arrayIndex?: number }[] = [];
    while (current) {
      if (current.variable?.type === ViewVariableType.ArrayObject) {
        // Default 0th
        pathList.unshift({
          objectKey: current.label,
          arrayIndex: 0,
        });
      } else {
        pathList.unshift({
          objectKey: current.label,
        });
      }
      current = current.parent;
    }
    let pathIndex = 0;
    segments.find((segment, index) => {
      if (segment.type !== ExpressionEditorSegmentType.ObjectKey) {
        return false;
      }
      const pathItem = pathList[pathIndex];
      pathIndex++;
      if (pathItem.objectKey !== segment.objectKey) {
        // exit the loop
        return true;
      }
      const nextSegment = segments[index + 1];
      if (
        typeof pathItem.arrayIndex === 'number' &&
        nextSegment?.type === ExpressionEditorSegmentType.ArrayIndex
      ) {
        pathItem.arrayIndex = nextSegment.arrayIndex;
      }
      return false;
    });
    return pathList
      .map((pathItem, index) => {
        const isLastPathItem = index === pathList.length - 1;
        if (typeof pathItem.arrayIndex === 'number' && !isLastPathItem) {
          return `${pathItem.objectKey}[${pathItem.arrayIndex}]`;
        }
        return pathItem.objectKey;
      })
      .join('.');
  };

  export const matchTreeBranch = (params: {
    tree: ExpressionEditorTreeNode[];
    segments: ExpressionEditorSegment[];
  }): ExpressionEditorTreeNode[] | undefined => {
    const { tree, segments } = params;
    const treeBranch: (ExpressionEditorTreeNode | null)[] = [];
    let treeLayer = tree;
    const invalid = segments.find((segment, index) => {
      const itemInvalid = (): boolean => {
        treeBranch.push(null);
        return true;
      };
      const itemValid = (treeNode?: ExpressionEditorTreeNode): boolean => {
        treeBranch.push(treeNode || null);
        return false;
      };
      const beforeTreeNode = treeBranch[treeBranch.length - 1];
      // Verify Illegal Case: Whether to Use Array Indexing for Non-Array Types
      if (
        segment.type === ExpressionEditorSegmentType.ArrayIndex &&
        beforeTreeNode &&
        (!beforeTreeNode.variable || !isArrayType(beforeTreeNode.variable.type))
      ) {
        return itemInvalid();
      }
      // Confirm illegal condition: Array can only follow array subscript
      if (
        beforeTreeNode?.variable?.type &&
        isArrayType(beforeTreeNode.variable.type) &&
        segment.type !== ExpressionEditorSegmentType.ArrayIndex
      ) {
        return itemInvalid();
      }
      // ignore
      if (segment.type !== ExpressionEditorSegmentType.ObjectKey) {
        return itemValid();
      }
      const treeNode = treeLayer.find(node => node.label === segment.objectKey);
      // Verify illegal condition: each object key must correspond to a variable node
      if (!treeNode) {
        return itemInvalid();
      }
      treeLayer = treeNode.children || [];
      return itemValid(treeNode);
    });
    const filteredTreeBranch = treeBranch.filter(
      Boolean,
    ) as ExpressionEditorTreeNode[];
    const filteredSegments = segments.filter(
      segment => segment.type === ExpressionEditorSegmentType.ObjectKey,
    );
    if (invalid || filteredSegments.length !== filteredTreeBranch.length) {
      return;
    }
    return filteredTreeBranch;
  };
}
