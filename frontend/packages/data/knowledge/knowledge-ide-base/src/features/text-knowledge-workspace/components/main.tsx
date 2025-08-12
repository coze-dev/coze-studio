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

/* eslint-disable @coze-arch/max-line-per-function */

/* eslint-disable complexity */
import { type ReactNode, useRef } from 'react';

import classnames from 'classnames';
import {
  useDataNavigate,
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import {
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { SegmentMenu } from '@coze-data/knowledge-common-components';
import { Spin } from '@coze-arch/coze-design';
import {
  ChunkType,
  DocumentSource,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';

import { type ProgressMap } from '@/types';

import { getDocumentOptions } from '../utils/document-utils';
import { useModals } from '../hooks/use-case/use-modals';
import { useInitSelectFirstDoc } from '../hooks/use-case/use-init-select-first-doc';
import { useFilePreview } from '../hooks/use-case/use-file-preview';
import { useDocumentManagement } from '../hooks/use-case/use-document-management';
import {
  useDocumentInfo,
  useSliceData,
  useLevelSegments,
  useSliceCounter,
} from '../hooks';
import { TextToolbar } from './text-toolbar';
import { LevelContent } from './level-content';
import { FilePreview } from './file-preview';
import { BaseContent } from './base-content';

export interface TextKnowledgeWorkspaceProps {
  onChangeDocList?: (docList: DocumentInfo[]) => void;
  reload?: () => void;
  progressMap: ProgressMap;
  linkOriginUrlButton?: ReactNode;
  fetchSliceButton?: ReactNode;
}

export const TextKnowledgeWorkspace = ({
  onChangeDocList,
  reload: reloadDataset,
  progressMap,
  linkOriginUrlButton,
  fetchSliceButton,
}: TextKnowledgeWorkspaceProps) => {
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const knowledgeParams = useKnowledgeParams();
  const documentList = useKnowledgeStore(state => state.documentList);
  const resourceNavigate = useDataNavigate();

  // Initialize to select the first document
  useInitSelectFirstDoc();

  // Document Management
  const {
    handleSelectDocument,
    handleRenameDocument,
    handleUpdateDocumentFrequency,
    rollbackDocumentSelection,
  } = useDocumentManagement({
    reloadDataset,
  });

  // Documentation basic information
  const { curDoc, curDocId, isProcessing, processFinished, datasetId } =
    useDocumentInfo(progressMap);

  // file preview
  const { showOriginalFile, handleToggleOriginalFile } =
    useFilePreview(curDocId);

  // document fragment data
  const { loading, renderData, handleContentChange, reload } = useSliceData({
    curDocId,
    datasetId,
    curChunkType: curDoc?.chunk_strategy?.chunk_type,
    processFinished,
    target: contentWrapperRef,
    rollbackDocumentSelection,
  });

  // hierarchical segmented data
  const {
    levelSegments,
    selectionIDs,
    setSelectionIDs,
    tosLoading,
    handleLevelSegmentsChange,
    handleLevelSegmentDelete,
  } = useLevelSegments({
    curDoc,
  });

  // fragment counter
  const { handleIncreaseSliceCount, handleDecreaseSliceCount } =
    useSliceCounter();

  // modal box
  const {
    deleteModalNode,
    showDeleteModal,
    updateFrequencyModalNode,
    showUpdateFrequencyModal,
  } = useModals({
    docId: curDoc?.document_id,
    documentType: curDoc?.format_type,
    documentSource: curDoc?.source_type,
    onDelete: () => {
      reloadDataset?.();
      handleSelectDocument('');
    },
    onUpdateFrequency: formData => {
      if (!onChangeDocList || !curDoc) {
        return;
      }

      const updatedDocList = handleUpdateDocumentFrequency(
        curDoc.document_id ?? '',
        formData,
      );

      if (updatedDocList) {
        onChangeDocList(updatedDocList);
      }
    },
  });

  // Document Options
  const docOptions = getDocumentOptions(documentList, progressMap);

  // Handle re-segmentation
  const handleResegment = () => {
    const isLocalText = Boolean(
      curDoc?.source_type === DocumentSource.Document,
    );
    resourceNavigate.upload?.({
      type: isLocalText ? UnitType.TEXT_DOC : UnitType.TEXT,
      opt: OptType.RESEGMENT,
      doc_id: curDocId ?? '',
      page_mode: knowledgeParams.pageMode ?? '',
      bot_id: knowledgeParams.botID ?? '',
    });
  };

  const fromProject = knowledgeParams.biz === 'project';

  return (
    <>
      <div
        className={classnames(
          'flex grow border-solid coz-stroke-primary coz-bg-max',
          fromProject
            ? 'h-[calc(100%-64px)] border-0 border-t'
            : 'h-[calc(100%-112px)] border rounded-[8px]',
        )}
      >
        <div
          className={classnames(
            'w-[300px] h-full shrink-0 overflow-auto p-[12px]',
            'border-0 border-r border-solid coz-stroke-primary',
          )}
        >
          <SegmentMenu
            isSearchable
            list={(documentList ?? []).map(item => ({
              id: item.document_id ?? '',
              title: item.name ?? '',
              label: docOptions.find(opt => opt.value === item.document_id)
                ?.label,
            }))}
            selectedID={curDocId}
            onClick={id => {
              if (id !== curDocId) {
                handleSelectDocument(id);
              }
            }}
            levelSegments={levelSegments}
            setSelectionIDs={setSelectionIDs}
            treeDisabled
            treeVisible={
              curDoc?.chunk_strategy?.chunk_type === ChunkType.LevelChunk
            }
          />
        </div>

        <Spin
          spinning={loading || tosLoading}
          size="large"
          wrapperClassName="h-full !w-full grow rounded-r-[8px] overflow-hidden"
          childStyle={{ height: '100%', flexGrow: 1, width: '100%' }}
        >
          <TextToolbar
            documentData={{
              curDoc,
              curDocId,
              curFormatType: curDoc?.format_type,
              docOptions,
            }}
            filePreviewData={{
              showOriginalFile,
              fileUrl: curDoc?.preview_tos_url,
            }}
            documentActions={{
              onChangeDoc: handleSelectDocument,
              onRenameDoc: handleRenameDocument,
              onToggleOriginalFile: handleToggleOriginalFile,
              onResegment: handleResegment,
              onUpdateFrequency: () =>
                showUpdateFrequencyModal({
                  updateInterval: curDoc?.update_interval,
                  updateType: curDoc?.update_type,
                }),
              onDelete: showDeleteModal,
              reloadDataset,
            }}
            customUIElements={{
              linkOriginUrlButton,
              fetchSliceButton,
            }}
          />

          <div className="flex h-[calc(100%-56px)] grow w-full">
            <FilePreview
              fileType={curDoc?.type}
              fileUrl={curDoc?.preview_tos_url || ''}
              visible={showOriginalFile}
            />

            <div
              ref={contentWrapperRef}
              className={classnames(
                'w-full grow h-full overflow-auto',
                'px-[16px] pt-[16px]',
              )}
            >
              {curDoc?.chunk_strategy?.chunk_type === ChunkType.LevelChunk ? (
                <LevelContent
                  isProcessing={isProcessing}
                  documentId={curDocId}
                  levelSegments={levelSegments}
                  selectionIDs={selectionIDs}
                  onLevelSegmentsChange={handleLevelSegmentsChange}
                  onLevelSegmentDelete={handleLevelSegmentDelete}
                />
              ) : (
                <BaseContent
                  loading={loading}
                  isProcessing={isProcessing}
                  documentId={curDocId}
                  renderData={renderData}
                  onContentChange={handleContentChange}
                  onAddChunk={() => {
                    reload();
                    handleIncreaseSliceCount();
                  }}
                  onDeleteChunk={() => {
                    handleDecreaseSliceCount();
                  }}
                />
              )}
            </div>
          </div>
        </Spin>
      </div>

      {deleteModalNode}
      {updateFrequencyModalNode}
    </>
  );
};
