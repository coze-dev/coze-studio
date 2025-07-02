import { type SliceInfo } from '@coze-arch/bot-api/knowledge';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';

export type DocumentChunk = Chunk & SliceInfo;
