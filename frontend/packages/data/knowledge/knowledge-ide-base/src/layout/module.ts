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

import { type ReactNode } from 'react';

import { type Dataset, type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import { type ProgressMap } from '@/types';

export interface KnowledgeIDEBaseLayoutProps {
  keepDocTitle?: boolean;
  className?: string;
  renderNavBar?: (context: KnowledgeRenderContext) => ReactNode;
  renderContent?: (context: KnowledgeRenderContext) => ReactNode;
}

/**
 * Knowledge base query related operations
 */
export interface KnowledgeDataActions {
  /** Reload the knowledge base data and document list */
  refreshData: () => void;
  /** Update Knowledge Base Dataset Details */
  updateDataSetDetail: (data: Dataset) => void;
  /** Update document list data */
  updateDocumentList: (data: DocumentInfo[]) => void;
}

/**
 * Knowledge Base Status Information
 */
export interface KnowledgeStatusInfo {
  /** Is the knowledge base loading? */
  isReloading: boolean;
  /** File processing progress information */
  progressMap: ProgressMap;
}

/**
 * Knowledge base data information
 */
export interface KnowledgeDataInfo {
  /** Knowledge Base Dataset Details */
  dataSetDetail: Dataset;
  /** document list */
  documentList: DocumentInfo[];
}

/**
 * knowledge base rendering context
 */
export interface KnowledgeRenderContext {
  /** Component property configuration */
  layoutProps: KnowledgeIDEBaseLayoutProps;
  /** Knowledge base data information */
  dataInfo: KnowledgeDataInfo;
  /** Knowledge Base Status Information */
  statusInfo: KnowledgeStatusInfo;
  /** Knowledge base data manipulation */
  dataActions: KnowledgeDataActions;
}
