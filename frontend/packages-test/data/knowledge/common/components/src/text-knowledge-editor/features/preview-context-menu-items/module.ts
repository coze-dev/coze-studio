import type React from 'react';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';

export interface PreviewContextMenuItemProps {
  chunk: Chunk;
  chunks?: Chunk[];
  disabled?: boolean;
}

export interface PreviewContextMenuItemModule {
  Component: React.ComponentType<PreviewContextMenuItemProps>;
}
