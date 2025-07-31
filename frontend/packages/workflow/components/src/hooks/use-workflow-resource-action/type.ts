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

import {
  type WorkflowMode,
  type ProductDraftStatus,
  type SchemaType,
} from '@coze-workflow/base';
import { type TableActionProps } from '@coze-arch/coze-design';
import { type ResourceInfo } from '@coze-arch/bot-api/plugin_develop';
export { type ResourceInfo };

export interface WorkflowResourceActionProps {
  /* refresh list function */
  refreshPage?: () => void;
  spaceId?: string;
  /* Current login user id */
  userId?: string;
  getCommonActions?: (
    libraryResource: ResourceInfo,
  ) => NonNullable<TableActionProps['actionList']>;
}
export interface WorkflowResourceActionReturn {
  /* Open the workflow creation pop-up window */
  openCreateModal: (flowMode?: WorkflowMode) => void;
  /* Global pop-ups for create, delete, etc. are directly mounted on the list parent container */
  workflowResourceModals: ReactNode[];
  /* Called in the render of the columns of the Table component, returning the Table. TableAction component */
  renderWorkflowResourceActions: (record: ResourceInfo) => ReactNode;
  /* Resource item click */
  handleWorkflowResourceClick: (record: ResourceInfo) => void;
}

export type UseWorkflowResourceAction = (
  props: WorkflowResourceActionProps,
) => WorkflowResourceActionReturn;

export interface WorkflowResourceBizExtend {
  product_draft_status: ProductDraftStatus;
  external_flow_info?: string;
  schema_type: SchemaType;
  plugin_id?: string;
  icon_uri: string;
  url: string;
}

export interface DeleteModalConfig {
  title: string;
  desc: string;
  okText: string;
  okHandle: () => void;
  cancelText: string;
}

export interface CommonActionProps extends WorkflowResourceActionProps {
  userId?: string;
}

export interface CommonActionReturn {
  actionHandler: (record: ResourceInfo) => void;
}
export interface DeleteActionReturn extends CommonActionReturn {
  deleteModal?: ReactNode;
}

export interface PublishActionReturn extends CommonActionReturn {
  publishModal: ReactNode;
}
