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

/* eslint-disable @coze-arch/use-error-in-catch */
import { get } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { OperateType, workflowApi } from '@coze-workflow/base/api';

import { EncapsulateContext } from '../encapsulate-context';
import {
  type EncapsulateWorkflowParams,
  type EncapsulateApiService,
} from './types';
import { ICON_URIS } from './constants';

@injectable()
export class EncapsulateApiServiceImpl implements EncapsulateApiService {
  @inject(EncapsulateContext)
  private encapsulateContext: EncapsulateContext;

  async encapsulateWorkflow({
    name,
    desc,
    json,
    flowMode,
  }: EncapsulateWorkflowParams) {
    try {
      const res = await workflowApi.EncapsulateWorkflow({
        space_id: this.encapsulateContext.spaceId,
        name,
        flow_mode: flowMode,
        desc,
        schema: JSON.stringify(json),
        icon_uri: ICON_URIS[flowMode],
        project_id: this.encapsulateContext.projectId,
      });

      const workflowId = res.data?.workflow_id;
      if (!workflowId) {
        return null;
      }

      return {
        workflowId,
      };
    } catch (e) {
      return null;
    }
  }

  async validateWorkflow(json) {
    try {
      const res = await workflowApi.EncapsulateWorkflow({
        space_id: this.encapsulateContext.spaceId,
        name: '',
        desc: '',
        icon_uri: '',
        schema: JSON.stringify(json),
        only_validate: true,
      });
      return res?.data?.validate_data || [];
    } catch (e) {
      return [
        {
          message: 'call validate api failed',
        },
      ];
    }
  }

  async getWorkflow(spaceId: string, workflowId: string, version?: string) {
    let json;
    // Scenes with historical versions get historical versions of data
    if (version) {
      const res = await workflowApi.GetHistorySchema({
        space_id: spaceId,
        workflow_id: workflowId,
        workflow_version: version,
        commit_id: '',
        type: OperateType.DraftOperate,
      });
      json = get(res, 'data.schema');
    } else {
      const res = await workflowApi.GetCanvasInfo({
        space_id: spaceId,
        workflow_id: workflowId,
      });

      json = get(res, 'data.workflow.schema_json');
    }

    if (!json) {
      return null;
    }

    return JSON.parse(json);
  }
}
