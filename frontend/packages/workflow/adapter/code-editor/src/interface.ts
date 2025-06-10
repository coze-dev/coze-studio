import { type ReactNode } from 'react';

import type {
  ViewVariableTreeNode,
  ViewVariableType,
} from '@coze-workflow/base';

export interface Input {
  name?: string;
  type?: ViewVariableType;
  children?: ViewVariableTreeNode[];
}

export interface Output {
  name?: string;
  type?: ViewVariableType;
  children?: Output[];
}

// javascript 为历史数据，目前只会有 python ｜ typescript
export type LanguageType = 'python' | 'typescript' | 'javascript';

export interface PreviewerProps {
  content: string;
  language: LanguageType;
  height?: number;
}

export interface EditorProps {
  defaultContent?: string;
  uuid: string;
  defaultLanguage: LanguageType;
  spaceId?: string;
  height?: string;
  width?: string;
  title?: string;
  readonly?: boolean;
  input?: Input[];
  output?: Output[];
  region?: string;
  locale?: string;
  onClose?: () => void;
  onChange?: (code: string, language: LanguageType) => void;
  languageTemplates?: Array<{
    language: 'typescript' | 'python';
    displayName: string;
    template: string;
  }>;
  onTestRun?: () => void;
  testRunIcon?: ReactNode;
  /**
   * @deprecated onTestRunStateChange 已失效，线上也未使用到
   */
  onTestRunStateChange?: (status: string) => void;
}

export interface EditorOtherProps {
  didMount?: (api?: { getValue?: () => string }) => void;
  language?: LanguageType;
}

export enum ModuleDetectionKind {
  /**
   * Files with imports, exports and/or import.meta are considered modules
   */
  Legacy = 1,
  /**
   * Legacy, but also files with jsx under react-jsx or react-jsxdev and esm mode files under moduleResolution: node16+
   */
  Auto = 2,
  /**
   * Consider all non-declaration files modules, regardless of present syntax
   */
  Force = 3,
}
