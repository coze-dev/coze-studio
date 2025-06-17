import type React from 'react';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';

export interface HoverEditBarActionProps {
  chunk: Chunk;
  chunks?: Chunk[];
  disabled?: boolean;
  onChunksChange?: (chunks: Chunk[]) => void;
}

export interface HoverEditBarActionModule {
  Component: React.ComponentType<HoverEditBarActionProps>;
}
