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

import {
  ProductDraftStatus,
  SchemaType,
  type FrontWorkflowInfo,
} from '@coze-workflow/base';
import { type ResourceInfo } from '@coze-arch/bot-api/plugin_develop';

import { type WorkflowResourceBizExtend } from './type';

export const parseWorkflowResourceBizExtend = (
  bizExtend?: Record<string, string>,
): WorkflowResourceBizExtend | undefined => {
  if (!bizExtend) {
    return undefined;
  }
  return {
    product_draft_status:
      bizExtend.product_draft_status !== undefined
        ? parseInt(bizExtend.product_draft_status || '0')
        : ProductDraftStatus.Default,
    external_flow_info: bizExtend.external_flow_info,
    schema_type:
      bizExtend.schema_type !== undefined
        ? parseInt(bizExtend.schema_type || '0')
        : SchemaType.DAG,
    plugin_id: bizExtend.plugin_id,
    icon_uri: bizExtend.icon_uri,
    url: bizExtend.url,
  };
};
/**
 * Convert ResourceInfo to WorkflowInfoLocal structure required to edit workflow
 * @param resource
 */
export const transformResourceToWorkflowEditInfo = (
  resource: ResourceInfo,
): Pick<
  FrontWorkflowInfo,
  | 'workflow_id'
  | 'url'
  | 'icon_uri'
  | 'name'
  | 'desc'
  | 'schema_type'
  | 'external_flow_info'
  | 'space_id'
> => {
  const bizExtend = parseWorkflowResourceBizExtend(resource.biz_extend);
  return {
    workflow_id: resource.res_id,
    url: bizExtend?.url,
    icon_uri: bizExtend?.icon_uri,
    name: resource.name,
    desc: resource.desc,
    schema_type: bizExtend?.schema_type,
    external_flow_info: bizExtend?.external_flow_info,
    space_id: resource.space_id,
  };
};
