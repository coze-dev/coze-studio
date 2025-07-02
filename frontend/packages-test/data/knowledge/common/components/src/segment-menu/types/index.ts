import { type ILevelSegment } from '@coze-data/knowledge-stores';

export type LevelDocumentTree = Omit<
  ILevelSegment,
  'children' | 'id' | 'parent'
> & {
  id: string;
  parent: string;
  children: LevelDocumentTree[];
};
