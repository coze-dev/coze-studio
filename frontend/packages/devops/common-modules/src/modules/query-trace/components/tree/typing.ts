import { type ReactNode, type SVGAttributes } from 'react';

export type LineAttrs = Pick<
  SVGAttributes<unknown>,
  'stroke' | 'strokeDasharray' | 'strokeWidth'
> & {
  lineRadius?: number; // line圆角半径 注意：这个数值不要大于 indent/2
  lineGap?: number; // line距离box的gap
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
  selectEnabled?: boolean; // 默认值 true
  indentDisabled?: boolean; // 关闭缩进。 仅针对如下场景生效：子节点中的最后一个节点
  lineStyle?: LineStyle; // 当指定了此属性时，会覆盖全局的lineStyle
  children?: TreeNode[];
  linePath?: PathEnum[];
  zIndex?: number;
  // 其他字段，会透传
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
  unindented: boolean; // 相对于父节点，是否未缩进
  selected: boolean; // 是否被选中
  hover: boolean; // 是否hover
};

// 拉平后的TreeNode信息
export type TreeNodeFlatten = Omit<TreeNodeExtra, 'selected' | 'hover'>;

export interface Line {
  startNode: TreeNodeFlatten;
  endNode: TreeNodeFlatten;
}

export interface GlobalStyle {
  indent?: number; // 父节点和子节点的缩进距离
  verticalInterval?: number; // node节点的垂直间距
  nodeBoxHeight?: number; // node-box节点的高度
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
  indentDisabled?: boolean; // 关闭缩进。 仅针对如下场景生效：最后一个节点
  lineStyle?: LineStyle;
  globalStyle?: GlobalStyle;
  className?: string;

  onSelect?: (info: Pick<MouseEventParams, 'node'>) => void;
  onClick?: (info: MouseEventParams) => void;
  onMouseMove?: (info: MouseEventParams) => void;
  onMouseEnter?: (info: MouseEventParams) => void;
  onMouseLeave?: (info: MouseEventParams) => void;
}
