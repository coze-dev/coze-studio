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
import { ViewVariableType } from '@coze-workflow/base/types';

import type {
  ExpressionEditorTreeNode,
  ExpressionEditorSegment,
  ExpressionEditorVariable,
} from '../type';
import { ExpressionEditorSegmentType } from '../constant';

export namespace ExpressionEditorTreeHelper {
  export interface Input {
    name: string;
    keyPath?: string[];
    children?: Input[];
  }

  export interface AvailableVariable extends Input {
    variable?: ExpressionEditorVariable;
    children?: AvailableVariable[];
  }

  const findAvailableVariable = (params: {
    variables: ExpressionEditorVariable[];
    input: Input;
  }): AvailableVariable => {
    const { variables, input } = params;

    if (!input.keyPath) {
      return {
        name: input.name,
      };
    }
    const nodeId = input.keyPath.shift();
    const nodePath = input.keyPath;
    const nodeVariables = variables.filter(
      variable => variable.nodeId === nodeId,
    );
    let variable: ExpressionEditorVariable | undefined;
    nodePath.reduce(
      (
        availableVariables: ExpressionEditorVariable[],
        path: string,
        index: number,
      ) => {
        const targetVariable = availableVariables.find(
          availableVariable => availableVariable.key === path,
        );
        if (index === nodePath.length - 1) {
          variable = targetVariable;
        }
        if (targetVariable && targetVariable.children) {
          return targetVariable.children;
        }
        return [];
      },
      nodeVariables,
    );
    if (!variable) {
      return {
        name: input.name,
      };
    }
    return {
      name: input.name,
      keyPath: input.keyPath,
      variable,
    };
  };

  export const findAvailableVariables = (params: {
    variables: ExpressionEditorVariable[];
    inputs: Input[];
  }): AvailableVariable[] => {
    const { variables, inputs } = params;
    return inputs.map(input => {
      const availableVariable = findAvailableVariable({ input, variables });

      if (input.children?.length) {
        availableVariable.children = findAvailableVariables({
          variables,
          inputs: input.children || [],
        });
      }

      return availableVariable;
    });
  };

  const createVariableLeaves = (
    variables: ExpressionEditorVariable[],
    parent: ExpressionEditorTreeNode,
  ): ExpressionEditorTreeNode[] =>
    variables.map(
      (variable: ExpressionEditorVariable): ExpressionEditorTreeNode => {
        const node: ExpressionEditorTreeNode = {
          label: variable.name,
          value: `${parent.value}.${variable.key}`,
          key: `${parent.value}.${variable.key}`,
          variable,
          parent,
        };
        node.children = createVariableLeaves(variable.children || [], node);
        return node;
      },
    );

  export const createVariableTree = (
    availableVariables: AvailableVariable[],
    parent?: ExpressionEditorTreeNode,
  ): ExpressionEditorTreeNode[] =>
    availableVariables.map(
      (availableVariable: AvailableVariable): ExpressionEditorTreeNode => {
        const path = parent
          ? `${parent.key}.${availableVariable.name}`
          : availableVariable.name;

        const node: ExpressionEditorTreeNode = {
          label: availableVariable.name,
          value: availableVariable.keyPath?.join('.') || path,
          key: path,
          keyPath: availableVariable.keyPath,
          variable: availableVariable.variable,
          parent,
        };

        if (availableVariable.children?.length) {
          node.children = createVariableTree(availableVariable.children, node);
        } else {
          node.children = createVariableLeaves(
            availableVariable.variable?.children || [],
            node,
          );
        }

        return node;
      },
    );

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
      const treeChild = treeLayer.find(
        node => node.label === segment.objectKey,
      );
      if (treeChild) {
        treeLayer = treeChild.children || [];
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
        (!beforeTreeNode.variable ||
          !ViewVariableType.isArrayType(beforeTreeNode.variable.type))
      ) {
        return itemInvalid();
      }
      // Confirm illegal condition: Array can only follow array subscript
      if (
        beforeTreeNode?.variable?.type &&
        ViewVariableType.isArrayType(beforeTreeNode.variable.type) &&
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
