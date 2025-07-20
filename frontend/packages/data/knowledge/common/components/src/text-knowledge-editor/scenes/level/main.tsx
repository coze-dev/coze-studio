/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import { useMemo, useEffect, useState, useCallback } from 'react';

import { type Editor } from '@tiptap/react';

import { updateChunkContent } from '@/text-knowledge-editor/services/inner/document-editor.service';
import { useSaveChunk } from '@/text-knowledge-editor/hooks/use-case/use-save-chunk';
import { useInitEditor } from '@/text-knowledge-editor/hooks/use-case/use-init-editor';
import { useEventListener } from '@/text-knowledge-editor/event';
import { TitleChunkPreview } from '@/text-knowledge-editor/components/preview-chunk/title';
import { ImageChunkPreview } from '@/text-knowledge-editor/components/preview-chunk/image';

import { editorContextActionRegistry } from '../base/editor-context-actions-contributes';
import { DocumentPreview } from '../../features/preview';
import { DocumentEditor } from '../../features/editor';
import {
  type LevelDocumentChunk,
  type LevelDocumentTreeNode,
} from './types/level-document';
import { createLocateChunkId } from './services/locate-segment';
import { getLevelDocumentTree } from './services/chunk-op.service';
import { previewContextMenuItemsContributes } from './preview-context-menu-items-contributes';
import { hoverEditBarActionsContributes } from './hover-edit-bar-actions-contributes';
import { useScrollToSelection } from './hooks/use-case';
import {
  useActiveChunk,
  type ActiveChunkInfo,
} from './hooks/inner/use-active-chunk';

export interface LevelTextKnowledgeEditorProps {
  documentId: string;
  chunks: LevelDocumentChunk[];
  readonly?: boolean;
  selectionIDs?: string[];
  onChange?: (chunks: LevelDocumentChunk[]) => void;
  onDeleteChunk?: (chunk: LevelDocumentChunk) => void;
}
export const LevelTextKnowledgeEditor: React.FC<
  LevelTextKnowledgeEditorProps
> = ({
  readonly,
  chunks: initialChunks,
  documentId,
  selectionIDs,
  onChange,
  onDeleteChunk,
}) => {
  const [chunks, setChunks] = useState<LevelDocumentChunk[]>(initialChunks);
  const levelDocumentTree = useMemo(
    () => getLevelDocumentTree(chunks),
    [chunks],
  );

  // 使用活动chunk hook
  const {
    activeChunkInfo,
    clearActiveChunk,
    setActiveChunkWithLevel,
    isActiveChunk,
  } = useActiveChunk();

  // 使用编辑器核心功能
  const { editor } = useInitEditor({
    chunk: activeChunkInfo.chunk,
  });

  // 分片功能
  const { saveChunk } = useSaveChunk({
    chunks: initialChunks,
    documentId,
    onChunksChange: newChunks => {
      onChange?.(newChunks as LevelDocumentChunk[]);
      clearActiveChunk();
    },
    onDeleteChunk: chunk => {
      onDeleteChunk?.(chunk as LevelDocumentChunk);
    },
  });

  // 使用滚动到选中元素的hook
  useScrollToSelection(selectionIDs);

  // 监听右键菜单事件
  useEventListener(
    'previewContextMenuItemAction',
    useCallback(({ type, targetChunk, chunks: newChunks }) => {
      if (type === 'delete') {
        onDeleteChunk?.(targetChunk as LevelDocumentChunk);
        newChunks && onChange?.(newChunks as LevelDocumentChunk[]);
      }
      if (type === 'edit') {
        setActiveChunkWithLevel(targetChunk as LevelDocumentTreeNode);
      }
    }, []),
  );

  // 监听悬浮编辑栏事件
  useEventListener(
    'hoverEditBarAction',
    useCallback(({ type, targetChunk, chunks: newChunks }) => {
      if (type === 'delete') {
        onDeleteChunk?.(targetChunk as LevelDocumentChunk);
        newChunks && onChange?.(newChunks as LevelDocumentChunk[]);
      }
      if (type === 'edit') {
        setActiveChunkWithLevel(targetChunk as LevelDocumentTreeNode);
      }
    }, []),
  );

  useEffect(() => {
    setChunks(initialChunks);
  }, [initialChunks]);

  if (!levelDocumentTree) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {levelDocumentTree.map(item => (
        <RenderContent
          key={item.text_knowledge_editor_chunk_uuid}
          editor={editor}
          chunks={chunks}
          levelDocumentTree={item}
          activeChunkInfo={activeChunkInfo}
          isActiveChunk={isActiveChunk}
          setActiveChunkWithLevel={setActiveChunkWithLevel}
          selectionIDs={selectionIDs}
          readonly={readonly}
          saveChunk={saveChunk}
          setChunks={setChunks}
        />
      ))}
    </div>
  );
};
interface SingleContentProps {
  editor: Editor | null;
  readonly?: boolean;
  chunks: LevelDocumentChunk[];
  levelDocumentTree?: LevelDocumentTreeNode;
  selectionIDs?: string[];
  activeChunkInfo: ActiveChunkInfo;
  isActiveChunk: (renderLevel: string | undefined) => boolean;
  setActiveChunkWithLevel: (chunk: LevelDocumentTreeNode) => void;
  setChunks: (chunks: LevelDocumentChunk[]) => void;
  saveChunk: (chunk: LevelDocumentChunk) => void;
}

const RenderContent = ({
  levelDocumentTree,
  selectionIDs,
  chunks,
  activeChunkInfo,
  isActiveChunk,
  setActiveChunkWithLevel,
  readonly,
  editor,
  saveChunk,
  setChunks,
}: SingleContentProps) => {
  const childrenContent = levelDocumentTree?.children?.length ? (
    <div className="flex w-full">
      <div className="w-6 shrink-0"></div>
      <div className="flex flex-col w-[calc(100%-24px)] gap-2">
        {levelDocumentTree.children.map(item => (
          <RenderContent
            key={item.text_knowledge_editor_chunk_uuid}
            editor={editor}
            chunks={chunks}
            saveChunk={saveChunk}
            levelDocumentTree={item}
            selectionIDs={selectionIDs}
            activeChunkInfo={activeChunkInfo}
            isActiveChunk={isActiveChunk}
            setActiveChunkWithLevel={setActiveChunkWithLevel}
            readonly={readonly}
            setChunks={setChunks}
          />
        ))}
      </div>
    </div>
  ) : null;

  if (!levelDocumentTree) {
    return null;
  }

  return (
    <div
      key={levelDocumentTree.text_knowledge_editor_chunk_uuid}
      className="flex flex-col gap-2 w-full"
    >
      {['title', 'section-title', 'page-title'].includes(
        levelDocumentTree.type,
      ) ? (
        <TitleChunkPreview
          title={levelDocumentTree.text}
          id={createLocateChunkId(levelDocumentTree.id)}
        />
      ) : null}
      {[
        'section-text',
        'text',
        'header-footer',
        'caption',
        'header',
        'footer',
        'formula',
        'footnote',
        'toc',
        'code',
        'table',
      ].includes(levelDocumentTree.type) ? (
        <div key={levelDocumentTree.text_knowledge_editor_chunk_uuid}>
          {(() => {
            // 检查这个chunk是否是当前活动的chunk，使用renderLevel字段
            const chunkIsActive = isActiveChunk(levelDocumentTree.renderLevel);

            if (chunkIsActive) {
              return (
                <DocumentEditor
                  editor={editor}
                  editorContextMenuItemsRegistry={editorContextActionRegistry}
                  onBlur={newContent => {
                    saveChunk?.(
                      updateChunkContent(
                        levelDocumentTree,
                        newContent,
                      ) as unknown as LevelDocumentChunk,
                    );
                  }}
                />
              );
            }
            return (
              <DocumentPreview
                chunk={levelDocumentTree}
                readonly={readonly}
                chunks={chunks}
                locateId={createLocateChunkId(levelDocumentTree.id)}
                hoverEditBarActionsRegistry={hoverEditBarActionsContributes}
                previewContextMenuItemsRegistry={
                  previewContextMenuItemsContributes
                }
                onActivateEditMode={activedChunk => {
                  // 设置活动chunk，使用chunk自身的renderLevel
                  setActiveChunkWithLevel(
                    activedChunk as LevelDocumentTreeNode,
                  );
                }}
              />
            );
          })()}
        </div>
      ) : null}

      {['image'].includes(levelDocumentTree.type) ? (
        <ImageChunkPreview
          base64={levelDocumentTree.image_detail.base64 ?? ''}
          htmlText={levelDocumentTree.html_text || levelDocumentTree.text}
          link={levelDocumentTree.image_detail.links?.[0] ?? ''}
          caption={levelDocumentTree.image_detail.caption ?? ''}
          locateId={createLocateChunkId(levelDocumentTree.id)}
          selected={selectionIDs?.includes(levelDocumentTree.id.toString())}
        />
      ) : null}
      {childrenContent}
    </div>
  );
};
