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
 
import React from 'react';

import {
  type BindBizType,
  type OrderBy,
  type WorkflowMode,
} from '@coze-workflow/base/api';
import { type SpaceType } from '@coze-arch/bot-api/playground_api';

import { type WorkflowModalState } from './type';
import { type I18nKey, type ModalI18nKey } from './hooks/use-i18n-text';

export interface WorkflowModalContextValue {
  spaceId: string;
  spaceType: SpaceType;
  bindBizId?: string;
  bindBizType?: BindBizType;
  /** 当前项目 id，只在项目内的 workflow 有该字段 */
  projectId?: string;
  /** 工作流类型，此参数由 WorkflowModal 弹窗创建时由 props 传进来，可能的值是 Workflow、Imageflow。用于区分添加哪种工作流 */
  flowMode: WorkflowMode;
  modalState: WorkflowModalState;
  /** 更新弹窗状态, merge 的模式 */
  updateModalState: (newState: Partial<WorkflowModalState>) => void;
  orderBy: OrderBy;
  setOrderBy: React.Dispatch<React.SetStateAction<OrderBy>>;
  createModalVisible: boolean;
  setCreateModalVisible: React.Dispatch<React.SetStateAction<boolean>>;

  /** 获取当前弹窗状态, 可用于恢复弹窗状态 */
  getModalState: (ctx: WorkflowModalContextValue) => WorkflowModalState;

  /** 自定义 i18n 文案 */
  i18nMap?: Partial<Record<ModalI18nKey, I18nKey>>;
}

const WorkflowModalContext =
  React.createContext<WorkflowModalContextValue | null>(null);

export default WorkflowModalContext;
