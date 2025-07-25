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
 
import { useCallback, useEffect, useState } from 'react';

import { useSaveChunk } from '@/text-knowledge-editor/hooks/use-case/use-save-chunk';
import { useInitEditor } from '@/text-knowledge-editor/hooks/use-case/use-init-editor';
import { useEventListener } from '@/text-knowledge-editor/event';

import { DocumentPreview } from '../../features/preview';
import { DocumentEditor } from '../../features/editor';
import { type DocumentChunk } from './types/base-document';
import { previewContextMenuItemsContributes } from './preview-context-menu-items-contributes';
import { hoverEditBarActionsContributes } from './hover-edit-bar-actions-contributes';
import { editorContextActionRegistry } from './editor-context-actions-contributes';
export interface BaseTextKnowledgeEditorProps {
  chunks: DocumentChunk[];
  documentId: string;
  readonly?: boolean;
  onChange?: (chunks: DocumentChunk[]) => void;
  onAddChunk?: (chunk: DocumentChunk) => void;
  onDeleteChunk?: (chunk: DocumentChunk) => void;
}

export const BaseTextKnowledgeEditor = ({
  chunks: initialChunks,
  documentId,
  readonly = false,
  onChange,
  onAddChunk,
  onDeleteChunk,
}: BaseTextKnowledgeEditorProps) => {
  const [chunks, setChunks] = useState<DocumentChunk[]>(initialChunks);
  const [activeChunk, setActiveChunk] = useState<DocumentChunk | null>(null);

  // 使用编辑器核心功能
  const { editor } = useInitEditor({
    chunk: activeChunk,
  });

  // 退出新增分片功能
  const { saveChunk } = useSaveChunk({
    chunks,
    documentId,
    onChunksChange: newChunks => {
      onChange?.(newChunks);
      setActiveChunk(null);
    },
    onAddChunk,
    onDeleteChunk,
  });

  // 监听右键菜单事件
  useEventListener(
    'previewContextMenuItemAction',
    useCallback(
      ({ type, newChunk, chunks: newChunks, targetChunk }) => {
        if (type === 'add-after') {
          newChunk && setActiveChunk(newChunk);
          newChunks && setChunks(newChunks);
        }
        if (type === 'add-before') {
          newChunk && setActiveChunk(newChunk);
          newChunks && setChunks(newChunks);
        }
        if (type === 'delete') {
          onDeleteChunk?.(targetChunk);
          newChunks && onChange?.(newChunks);
        }
        if (type === 'edit') {
          setActiveChunk(targetChunk);
        }
      },
      [onDeleteChunk, onChange],
    ),
  );

  // 监听悬浮编辑栏事件
  useEventListener(
    'hoverEditBarAction',
    useCallback(
      ({ type, targetChunk, chunks: newChunks, newChunk }) => {
        if (type === 'add-after') {
          newChunk && setActiveChunk(newChunk);
          newChunks && setChunks(newChunks);
        }
        if (type === 'add-before') {
          newChunk && setActiveChunk(newChunk);
          newChunks && setChunks(newChunks);
        }
        if (type === 'delete') {
          onDeleteChunk?.(targetChunk);
          newChunks && onChange?.(newChunks);
        }
        if (type === 'edit') {
          setActiveChunk(targetChunk);
        }
      },
      [onDeleteChunk, onChange],
    ),
  );

  useEffect(() => {
    setChunks(initialChunks);
  }, [initialChunks]);

  return (
    <>
      {chunks.map(chunk => (
        <div key={chunk.text_knowledge_editor_chunk_uuid}>
          {(() => {
            if (
              chunk.text_knowledge_editor_chunk_uuid ===
                activeChunk?.text_knowledge_editor_chunk_uuid &&
              activeChunk
            ) {
              return (
                <DocumentEditor
                  editor={editor}
                  editorContextMenuItemsRegistry={editorContextActionRegistry}
                  onBlur={content => {
                    saveChunk({
                      ...activeChunk,
                      content,
                    });
                  }}
                />
              );
            }
            return (
              <DocumentPreview
                chunk={chunk}
                chunks={chunks}
                readonly={readonly}
                onActivateEditMode={setActiveChunk}
                hoverEditBarActionsRegistry={hoverEditBarActionsContributes}
                previewContextMenuItemsRegistry={
                  previewContextMenuItemsContributes
                }
              />
            );
          })()}
        </div>
      ))}
    </>
  );
};
