import { useState, useMemo, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { type ILevelSegment } from '@coze-data/knowledge-stores';
import { useTosContent } from '@coze-data/knowledge-common-hooks';
import { withTitle } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/level';
import { ChunkType, type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import { createLevelDocumentChunkByLevelSegment } from '../../utils/document-utils';

interface UseLevelSegmentsParams {
  curDoc?: DocumentInfo;
}

/**
 * 处理层级分段数据的 hook
 */
export const useLevelSegments = ({ curDoc }: UseLevelSegmentsParams) => {
  // 用于层级分段选中滚动
  const [selectionIDs, setSelectionIDs] = useState<string[]>([]);

  const { levelSegments, setLevelSegments } = useKnowledgeStore(
    useShallow(state => ({
      levelSegments: state.levelSegments,
      setLevelSegments: state.setLevelSegments,
    })),
  );

  // 获取层级分段 slice 列表
  const { content: treeContent, loading: tosLoading } = useTosContent(
    curDoc?.chunk_strategy?.chunk_type === ChunkType.LevelChunk
      ? curDoc?.doc_tree_tos_url
      : undefined,
  );

  // 使用 useMemo 缓存转换后的层级分段数据
  const renderLevelSegmentsData = useMemo(
    () =>
      levelSegments.map(item => createLevelDocumentChunkByLevelSegment(item)),
    [levelSegments],
  );

  // 处理层级分段变更
  const handleLevelSegmentsChange = (chunks: ILevelSegment[]) => {
    setLevelSegments(chunks);
  };

  // 处理删除层级分段
  const handleLevelSegmentDelete = (chunk: ILevelSegment) => {
    setLevelSegments(
      levelSegments.filter(item => item.slice_id !== chunk.slice_id),
    );
  };

  // 初始化时加载层级分段
  useEffect(() => {
    setLevelSegments(withTitle(treeContent?.chunks ?? [], curDoc?.name ?? ''));
  }, [treeContent]);

  return {
    levelSegments,
    renderLevelSegmentsData,
    selectionIDs,
    setSelectionIDs,
    tosLoading,
    handleLevelSegmentsChange,
    handleLevelSegmentDelete,
  };
};
