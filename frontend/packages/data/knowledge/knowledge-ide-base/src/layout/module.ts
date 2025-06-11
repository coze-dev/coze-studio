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
  /** 文档列表是否正在加载 */
  isDocumentLoading: boolean;
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
