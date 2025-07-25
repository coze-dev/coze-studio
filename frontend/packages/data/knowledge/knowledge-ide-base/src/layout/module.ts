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
 * 知识库查询相关操作
 */
export interface KnowledgeDataActions {
  /** 重新加载知识库数据与文档列表 */
  refreshData: () => void;
  /** 更新知识库数据集详情 */
  updateDataSetDetail: (data: Dataset) => void;
  /** 更新文档列表数据 */
  updateDocumentList: (data: DocumentInfo[]) => void;
}

/**
 * 知识库状态信息
 */
export interface KnowledgeStatusInfo {
  /** 知识库是否正在加载 */
  isReloading: boolean;
  /** 文件处理进度信息 */
  progressMap: ProgressMap;
}

/**
 * 知识库数据信息
 */
export interface KnowledgeDataInfo {
  /** 知识库数据集详情 */
  dataSetDetail: Dataset;
  /** 文档列表 */
  documentList: DocumentInfo[];
}

/**
 * 知识库渲染上下文
 */
export interface KnowledgeRenderContext {
  /** 组件属性配置 */
  layoutProps: KnowledgeIDEBaseLayoutProps;
  /** 知识库数据信息 */
  dataInfo: KnowledgeDataInfo;
  /** 知识库状态信息 */
  statusInfo: KnowledgeStatusInfo;
  /** 知识库数据操作 */
  dataActions: KnowledgeDataActions;
}
