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

import { inject, injectable } from 'inversify';
import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { WorkflowGlobalStateEntity } from '@/entities';

import { type SubWorkflowDetailDTO, type Identifier } from '../types';
import { createStore } from './subworkflow-node-store';

@injectable()
export class SubWorkflowNodeService {
  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;

  store = createStore();

  set loading(v: boolean) {
    this.store.setState({
      loading: v,
    });
  }

  get state() {
    return this.store.getState();
  }

  getApiDetail(identifier: Identifier) {
    return this.state.getData(identifier);
  }

  getApiError(identifier: Identifier) {
    return this.state.getError(identifier);
  }

  clearApiError(identifier: Identifier) {
    this.state.clearError(identifier);
  }

  async fetchData(
    identifier: Identifier,
  ): Promise<SubWorkflowDetailDTO | undefined> {
    const { spaceId } = this.globalState;
    const { workflowId, workflowVersion } = identifier;

    const resp = await workflowApi.GetWorkflowDetailInfo(
      {
        space_id: spaceId,
        workflow_filter_list: [
          {
            workflow_id: workflowId,
            workflow_version: workflowVersion ? workflowVersion : undefined,
          },
        ],
      },
      {
        __disableErrorToast: true,
      },
    );

    const workflowInfo = resp?.data?.[0] as SubWorkflowDetailDTO;
    return workflowInfo
      ? {
          ...workflowInfo,
          // Unpublished workflows may have parameters that do not have a name entered and need to be filtered out
          inputs: workflowInfo.inputs?.filter(i => i.name),
        }
      : undefined;
  }

  async load(identifier: Identifier, workflowTitle: string) {
    let subWorkflowDetail: SubWorkflowDetailDTO | undefined = undefined;
    let errorMessage = '';

    try {
      this.loading = true;
      const response = await this.fetchData(identifier);
      if (response) {
        subWorkflowDetail = response;
      }
    } catch (error) {
      errorMessage = error.message;
    } finally {
      this.loading = false;
    }

    if (errorMessage) {
      this.state.setError(identifier, errorMessage);
    }

    if (!subWorkflowDetail) {
      const notFoundMessage = I18n.t('workflow_node_lose_efficacy_wf', {
        name: workflowTitle,
      });
      this.state.setError(identifier, errorMessage || notFoundMessage);
      return;
    } else {
      this.state.setData(identifier, {
        ...subWorkflowDetail,
      });
    }

    return subWorkflowDetail;
  }
}
