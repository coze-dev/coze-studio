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

/* eslint-disable complexity */

import { type ReactNode } from 'react';

import classnames from 'classnames';
import { isFeishuOrLarkDocumentSource } from '@coze-data/utils';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozAdjust,
  IconCozHistory,
  IconCozTrashCan,
} from '@coze-arch/coze-design/icons';
import { Space, Tooltip, IconButton, Switch } from '@coze-arch/coze-design';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import {
  DocumentSource,
  FormatType,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';

import { DocTag } from './doc-tag';
import { DocSelector } from './doc-selector';

// Documentation basic information
export interface DocumentData {
  curDoc?: DocumentInfo;
  curDocId: string;
  curFormatType?: FormatType;
  docOptions: OptionProps[];
}

// File preview related
export interface FilePreviewData {
  showOriginalFile: boolean;
  fileUrl?: string;
}

// document action callback
export interface DocumentActions {
  onChangeDoc: (docId: string) => void;
  onRenameDoc: (docId: string, newName: string) => void;
  onToggleOriginalFile: (checked: boolean) => void;
  onResegment: () => void;
  onUpdateFrequency: () => void;
  onDelete: () => void;
  reloadDataset?: () => void;
}

// Custom UI elements
export interface CustomUIElements {
  linkOriginUrlButton?: ReactNode;
  fetchSliceButton?: ReactNode;
}

export interface TextToolbarProps {
  documentData: DocumentData;
  filePreviewData: FilePreviewData;
  documentActions: DocumentActions;
  customUIElements: CustomUIElements;
}

export const TextToolbar: React.FC<TextToolbarProps> = ({
  documentData: { curDoc, curDocId, curFormatType, docOptions },
  filePreviewData: { showOriginalFile, fileUrl },
  documentActions: {
    onChangeDoc,
    onRenameDoc,
    onToggleOriginalFile,
    onResegment,
    onUpdateFrequency,
    onDelete,
  },
  customUIElements: { linkOriginUrlButton, fetchSliceButton },
}) => {
  const canEdit = useKnowledgeStore(state => state.canEdit);

  // Control button display logic
  const showUpdateFreBtn =
    canEdit &&
    curDoc &&
    (curDoc.source_type === DocumentSource.Web ||
      isFeishuOrLarkDocumentSource(curDoc?.source_type));

  const showDeleteDocBtn = curDoc && canEdit;
  const showResegmentButton = curDoc?.format_type === FormatType.Text;
  const showFetchSliceBtn =
    canEdit &&
    curDoc &&
    ![DocumentSource.Custom, DocumentSource.Document].includes(
      curDoc.source_type as DocumentSource,
    );

  return (
    <div
      className={classnames(
        'w-full flex items-center justify-between py-[12px] px-[16px]',
        'border border-solid coz-stroke-primary border-l-0 border-t-0 border-r-0',
      )}
    >
      <div className={classnames('flex items-center')}>
        <DocSelector
          type={curFormatType as FormatType}
          options={docOptions}
          canEdit={canEdit}
          value={curDocId}
          onChange={onChangeDoc}
          onRename={onRenameDoc}
        />
        <DocTag documentInfo={curDoc} />
      </div>

      <Space spacing={8}>
        {fileUrl ? (
          <div className="flex items-center gap-2">
            <span className="coz-fg-secondary text-[12px] leading-[16px]">
              {I18n.t('knowledge_level_030')}
            </span>
            <Switch
              size="mini"
              checked={showOriginalFile}
              onChange={onToggleOriginalFile}
            ></Switch>
          </div>
        ) : null}

        {showResegmentButton && canEdit ? (
          <Tooltip theme="dark" content={I18n.t('knowledge_new_001')}>
            <IconButton
              data-testid={KnowledgeE2e.SegmentDetailUpdateBtn}
              iconPosition="left"
              color="secondary"
              size="small"
              icon={<IconCozAdjust />}
              onClick={onResegment}
            />
          </Tooltip>
        ) : null}

        {showUpdateFreBtn ? (
          <Tooltip
            theme="dark"
            content={I18n.t('datasets_unit_upload_field_update_frequency')}
          >
            <IconButton
              data-dtestid={`${KnowledgeE2e.SegmentDetailContentItemFrequencyIcon}.${curDoc?.document_id}`}
              icon={<IconCozHistory className="text-[14px]" />}
              iconPosition="left"
              color="secondary"
              size="small"
              onClick={onUpdateFrequency}
            ></IconButton>
          </Tooltip>
        ) : null}

        {showFetchSliceBtn ? fetchSliceButton : null}
        {linkOriginUrlButton}

        {showDeleteDocBtn ? (
          <Tooltip theme="dark" content={I18n.t('kl2_006')}>
            <IconButton
              data-testid={KnowledgeE2e.SegmentDetailContentDeleteIcon}
              icon={<IconCozTrashCan className="text-[14px]" />}
              color="secondary"
              iconPosition="left"
              size="small"
              onClick={onDelete}
            ></IconButton>
          </Tooltip>
        ) : null}
      </Space>
    </div>
  );
};
