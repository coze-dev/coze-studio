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
  /* 刷新列表函数 */
  refreshPage?: () => void;
  spaceId?: string;
  /* 当前登录用户 id */
  userId?: string;
  getCommonActions?: (
    libraryResource: ResourceInfo,
  ) => NonNullable<TableActionProps['actionList']>;
}
export interface WorkflowResourceActionReturn {
  /* 打开 workflow 创建弹窗 */
  openCreateModal: (flowMode?: WorkflowMode) => void;
  /* 创建、删除等操作的全局弹窗，直接挂载到列表父容器上 */
  workflowResourceModals: ReactNode[];
  /* 在 Table 组件的 columns 的 render 里调用，返回 Table.TableAction 组件 */
  renderWorkflowResourceActions: (record: ResourceInfo) => ReactNode;
  /* 资源 item 点击 */
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
