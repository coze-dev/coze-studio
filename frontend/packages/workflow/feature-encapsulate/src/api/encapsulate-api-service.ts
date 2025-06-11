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
    // 有历史版本的场景获取历史版本的数据
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
