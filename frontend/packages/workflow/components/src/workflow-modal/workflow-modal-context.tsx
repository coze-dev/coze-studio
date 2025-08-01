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
  /** The current project id, only the workflow within the project has this field */
  projectId?: string;
  /** Workflow type, this parameter is passed in by props when created by WorkflowModal pop-up window, possible values are Workflow, Imageflow. Used to distinguish which workflow to add */
  flowMode: WorkflowMode;
  modalState: WorkflowModalState;
  /** Update popup status, merge mode */
  updateModalState: (newState: Partial<WorkflowModalState>) => void;
  orderBy: OrderBy;
  setOrderBy: React.Dispatch<React.SetStateAction<OrderBy>>;
  createModalVisible: boolean;
  setCreateModalVisible: React.Dispatch<React.SetStateAction<boolean>>;

  /** Get the current pop-up state, which can be used to restore the pop-up state */
  getModalState: (ctx: WorkflowModalContextValue) => WorkflowModalState;

  /** Custom i18n copy */
  i18nMap?: Partial<Record<ModalI18nKey, I18nKey>>;
}

const WorkflowModalContext =
  React.createContext<WorkflowModalContextValue | null>(null);

export default WorkflowModalContext;
