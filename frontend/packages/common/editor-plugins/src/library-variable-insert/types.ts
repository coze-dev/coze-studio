import { type ComponentProps } from 'react';

import { type Popover } from '@coze-arch/coze-design';

import type { ILibraryList } from '../library-insert';
import type { ExpressionEditorTreeNode } from '../expression/core';

export interface ContentSearchPopoverProps {
  libraries: ILibraryList;
  direction?: ComponentProps<typeof Popover>['position'];
  readonly?: boolean;
  onInsert?: (insertPosition: { from: number; to: number }) => void;
  variableTree?: ExpressionEditorTreeNode[];
}
