import {
  type LevelDocumentTree,
  type LevelDocumentChunk,
} from '../types/level-document';

export const getLevelDocumentTree = (
  segments: LevelDocumentChunk[],
): LevelDocumentTree | [] => {
  const root = segments.find(f => f.parent === -1 && f.type === 'title');

  if (!root) {
    return segments.map(item => ({
      ...item,
      text: item.content ?? '',
      parent: item.parent?.toString(),
      children: [],
      renderLevel: `root-${item.text_knowledge_editor_chunk_uuid}`,
    }));
  }

  return [
    {
      ...root,
      text: root.content ?? '',
      parent: root.parent?.toString(),
      children: getChildren(root, segments, 'root'),
      renderLevel: `root-${root.text_knowledge_editor_chunk_uuid}`,
    },
  ];
};

/** Segments to TreeNodes */
const getChildren = (
  target: LevelDocumentChunk,
  list: LevelDocumentChunk[],
  parentPath: string,
): LevelDocumentTree =>
  (target.children ?? []).reduce<LevelDocumentTree>((acc, cur, index) => {
    const found = list.find(f => f.id.toString() === cur.toString());
    if (found) {
      const currentPath = `${parentPath}-${index}`;
      const renderLevel = `${currentPath}-${found.text_knowledge_editor_chunk_uuid}`;
      return [
        ...acc,
        {
          ...found,
          parent: found.parent?.toString(),
          text: found.content ?? '',
          children: getChildren(found, list, currentPath),
          renderLevel,
        },
      ];
    } else {
      return [...acc];
    }
  }, []);

/** 兜底情况，如果 idp 的结果没有标题，则补上标题 */
export const withTitle = (
  segments: LevelDocumentChunk[],
  title?: string,
): LevelDocumentChunk[] =>
  segments.map(item => {
    if (item.parent === -1 && item.type === 'title' && !item.text) {
      return {
        ...item,
        text: title ?? '',
      };
    }
    return item;
  });
