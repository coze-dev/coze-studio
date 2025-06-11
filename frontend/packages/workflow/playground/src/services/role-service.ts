import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { debounce } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { workflowApi } from '@coze-workflow/base';
import { type ChatFlowRole } from '@coze-arch/bot-api/workflow_api';

import { WorkflowGlobalStateEntity } from '@/entities';

const DEBOUNCE_TIME = 1000;

export interface RoleServiceState {
  /**
   * 是否首次加载完成
   */
  isReady: boolean;
  /**
   * 是否在加载角色配置
   */
  loading: boolean;
  /**
   * 是否在保存角色配置
   */
  saving: boolean;
  /**
   * 角色配置数据
   */
  data: ChatFlowRole | null;
}

const createStore = () =>
  createWithEqualityFn<RoleServiceState>(
    () => ({
      isReady: false,
      loading: false,
      saving: false,
      data: null,
    }),
    shallow,
  );

@injectable()
export class RoleService {
  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;

  store = createStore();

  get role() {
    return this.store.getState().data;
  }

  set role(v: ChatFlowRole | null) {
    this.store.setState({
      data: v,
    });
  }

  set loading(v: boolean) {
    this.store.setState({
      loading: v,
    });
  }

  async load() {
    const { workflowId } = this.globalState;
    this.loading = true;
    const res = await workflowApi.GetChatFlowRole({
      workflow_id: workflowId,
      connector_id: '10000010',
      ext: {
        _caller: 'CANVAS',
      },
    });
    this.store.setState({
      isReady: true,
      loading: false,
      data: res.role || null,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async save(next: any) {
    const { workflowId } = this.globalState;
    await workflowApi.CreateChatFlowRole({
      chat_flow_role: {
        workflow_id: workflowId,
        connector_id: '10000010',
        ...next,
      },
    });
    this.role = next;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debounceSave = debounce((next: any) => {
    this.save(next);
  }, DEBOUNCE_TIME);
}
