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
   * Is the first load complete?
   */
  isReady: boolean;
  /**
   * Is the role configuration loading?
   */
  loading: boolean;
  /**
   * Are you saving the role configuration?
   */
  saving: boolean;
  /**
   * role configuration data
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
