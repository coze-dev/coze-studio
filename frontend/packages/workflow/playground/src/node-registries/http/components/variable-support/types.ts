import type { EditorAPI } from '@coze-editor/editor/preset-universal';
import type { Tree } from '@coze-arch/coze-design';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

export interface VariableWithNodeInfo {
  expressionPath: {
    source: string;
    keyPath: string[];
  };
  nodeId: string;
  iconUrl: string;
  nodeTitle: string;
  globalVariableKey: string;
}

export interface InputVariableInfo {
  iconUrl: string;
  nodeTitle: string;
  isValid: boolean;
  globalVariableKey: string;
  parsedKeyPath?: string;
  isVariableExist?: boolean;
}

interface InterpolationContent {
  from: number;
  to: number;
  text: string;
  offset: number;
  textBefore: string;
}

export type { InterpolationContent };

interface CompletionContext {
  from: number;
  to: number;
  text: string;
  offset: number;
  textBefore: string;
}

export type { CompletionContext };

export type VariableMenuRefType = React.MutableRefObject<{
  treeContainerRef: HTMLDivElement | null;
  treeRef: Tree | null;
} | null>;

export type ApplyNodeType = (
  data: TreeNodeData,
  context: {
    type: 'input' | 'update';
    customRange?: RangeType;
  },
  editorRef?: React.MutableRefObject<EditorAPI | undefined>,
) => void;

export interface UseOptionsOperationsProps {
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  context: CompletionContext | undefined;
  dropdownContext: {
    dropdownRef: React.MutableRefObject<HTMLDivElement | null>;
    setActiveOptionHover: (index: number) => void;
    variableMenuRef: VariableMenuRefType;
  };
  setTreeVisible: (visible: boolean) => void;
  isInputDropdownOpen: boolean;
  applyNode: ApplyNodeType;
}

export interface RangeType {
  from: number;
  to: number;
}
