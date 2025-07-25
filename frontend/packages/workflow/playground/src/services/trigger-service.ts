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
 
import { pick } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { QueryClient } from '@tanstack/react-query';
import {
  StandardNodeType,
  workflowApi,
  type WorkflowDetailInfoData,
} from '@coze-workflow/base';

import {
  type TriggerFormMeta,
  fetchStartNodeTriggerFormValue,
  fetchTriggerFormMeta,
} from '@/node-registries/trigger-upsert/utils';
import { WorkflowGlobalStateEntity } from '@/entities';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const loadSubWorkflowInfo = async ({
  spaceId,
  workflowId,
}: {
  spaceId: string;
  workflowId: string;
  isInProject: boolean;
}) => {
  const data = await queryClient.fetchQuery({
    queryKey: ['loadSubWorkflowInfo', spaceId, workflowId],
    queryFn: async () => {
      const resp = await workflowApi.GetWorkflowDetailInfo(
        {
          space_id: spaceId,
          workflow_filter_list: [
            {
              workflow_id: workflowId,
            },
          ],
        },
        { __disableErrorToast: true },
      );
      const workflowInfo = resp?.data?.[0];
      return workflowInfo;
    },
  });
  return data;
};

@injectable()
export class TriggerService {
  @inject(WorkflowGlobalStateEntity)
  readonly globalState: WorkflowGlobalStateEntity;

  protected formMeta: TriggerFormMeta;
  protected subWorkflowInfos: Record<string, WorkflowDetailInfoData> = {};
  protected startNodeFormValues: Record<string, unknown> = {};
  async load() {
    // The community version does not support the project trigger feature, for future expansion
    if (this.globalState.projectId && !IS_OPEN_SOURCE) {
      const meta = await fetchTriggerFormMeta({
        spaceId: this.globalState.spaceId,
        projectId: this.globalState.projectId,
        workflowId: this.globalState.workflowId,
      });
      this.formMeta = meta;

      const schema = JSON.parse(this.globalState.info?.schema_json || '{}');
      const startNode = schema.nodes.filter(
        node => node.type === StandardNodeType.Start,
      );

      const { formValue, triggerId } = await fetchStartNodeTriggerFormValue({
        spaceId: this.globalState.spaceId,
        projectId: this.globalState.projectId,
        workflowId: this.globalState.workflowId,
        projectVersion: this.globalState.projectCommitVersion,
        outputs: startNode?.[0]?.data?.outputs,
      });

      // const { dynamicInputs, ...rest } = formValue ?? {};
      const dynamicInputs = pick(
        formValue,
        meta.startNodeFormMeta.map(d => d.name),
      );

      this.setStartNodeFormValues({
        isOpen: formValue.isOpen,
        dynamicInputs: dynamicInputs ?? meta.startNodeDefaultFormValue,
        parameters: formValue.parameters,
        triggerId,
      });

      const triggerUpsertNodes = schema.nodes.filter(
        node => node.type === StandardNodeType.TriggerUpsert,
      );

      const bindWorkflowIds = triggerUpsertNodes
        .map(node => node?.data?.inputs?.meta?.workflowId)
        .filter(Boolean);
      await Promise.all(
        bindWorkflowIds.map(workflowId => this.setBindWorkflowInfo(workflowId)),
      );
    }
  }

  getTriggerDynamicFormMeta() {
    return this.formMeta;
  }

  getBindWorkflowInfo = (workflowId?: string) => {
    if (!workflowId) {
      return undefined;
    }
    return this.subWorkflowInfos[workflowId];
  };

  setBindWorkflowInfo = async (workflowId?: string) => {
    if (!workflowId || this.subWorkflowInfos[workflowId]) {
      return;
    }

    const info = await loadSubWorkflowInfo({
      spaceId: this.globalState.spaceId,
      isInProject: !!this.globalState.projectId,
      workflowId,
    });

    this.subWorkflowInfos[workflowId] = info;
  };

  getStartNodeFormValues = () => this.startNodeFormValues;

  setStartNodeFormValues = (values: Record<string, unknown>) => {
    this.startNodeFormValues = {
      ...this.startNodeFormValues,
      ...values,
    };
  };
}
