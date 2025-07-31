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

import { type ReactNode, type SVGAttributes } from 'react';

export type LineAttrs = Pick<
  SVGAttributes<unknown>,
  'stroke' | 'strokeDasharray' | 'strokeWidth'
> & {
  lineRadius?: number; // Line fillet radius, note: this value should not be greater than indent/2
  lineGap?: number; // Line distance box gap
};

export interface LineStyle {
  normal?: LineAttrs;
  select?: LineAttrs;
  hover?: LineAttrs;
}

// tree-node-box
export interface TreeNode {
  key: string;
  title: ReactNode | ((nodeData: TreeNodeExtra) => ReactNode);
  selectEnabled?: boolean; // Default value true
  indentDisabled?: boolean; // Turn off indentation. Only works for the following scenarios: the last node in the sub-node
  lineStyle?: LineStyle; // When this property is specified, the global lineStyle is overridden.
  children?: TreeNode[];
  linePath?: PathEnum[];
  zIndex?: number;
  // Other fields will be passed through
  extra?: unknown;
}

export enum PathEnum {
  Hidden = 0,
  Show = 1,
  Active = 2,
}

export type TreeNodeExtra = Omit<TreeNode, 'children'> & {
  colNo: number;
  rowNo: number;
  unindented: boolean; // Is it unindented relative to the parent node?
  selected: boolean; // Is it selected?
  hover: boolean; // Whether to hover
};

// Flattened TreeNode information
export type TreeNodeFlatten = Omit<TreeNodeExtra, 'selected' | 'hover'>;

export interface Line {
  startNode: TreeNodeFlatten;
  endNode: TreeNodeFlatten;
}

export interface GlobalStyle {
  indent?: number; // Indent distance of parent and child nodes
  verticalInterval?: number; // Vertical spacing of nodes
  nodeBoxHeight?: number; // The height of the node-box node
  offsetX?: number;
}

export interface MouseEventParams {
  event: React.MouseEvent<HTMLDivElement>;
  node: TreeNodeExtra;
}

export interface TreeProps {
  treeData: TreeNode;
  selectedKey?: string;
  hoverKey?: string;
  disableDefaultHover?: boolean;
  indentDisabled?: boolean; // Turn off indentation. Only works for the following scenarios: the last node
  lineStyle?: LineStyle;
  globalStyle?: GlobalStyle;
  className?: string;

  onSelect?: (info: Pick<MouseEventParams, 'node'>) => void;
  onClick?: (info: MouseEventParams) => void;
  onMouseMove?: (info: MouseEventParams) => void;
  onMouseEnter?: (info: MouseEventParams) => void;
  onMouseLeave?: (info: MouseEventParams) => void;
}
