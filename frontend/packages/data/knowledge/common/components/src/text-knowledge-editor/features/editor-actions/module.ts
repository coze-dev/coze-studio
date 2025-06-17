import type React from 'react';

import { type Editor } from '@tiptap/react';

export interface EditorActionProps {
  editor: Editor | null;
  disabled?: boolean;
  onlyIcon?: boolean;
  showTooltip?: boolean;
}

export interface EditorActionModule {
  Component: React.ComponentType<EditorActionProps>;
  showTooltip?: boolean;
  disabled?: boolean;
  onlyIcon?: boolean;
}
