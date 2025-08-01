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

import queryString from 'query-string';
import { type EVENT_NAMES, type ParamsTypeDefine } from '@coze-arch/tea';
import {
  ProductEntityType,
  type ProductInfo,
} from '@coze-arch/bot-api/product_api';

export function convertTemplateType(
  entityType?: ProductEntityType,
): ParamsTypeDefine[EVENT_NAMES.template_action_front]['template_type'] {
  switch (entityType) {
    case ProductEntityType.WorkflowTemplateV2:
      return 'workflow';
    case ProductEntityType.ImageflowTemplateV2:
      return 'imageflow';
    case ProductEntityType.BotTemplate:
      return 'bot';
    case ProductEntityType.ProjectTemplate:
      return 'project';
    default:
      return 'unknown';
  }
}

export function extractTemplateActionCommonParams(detail?: ProductInfo) {
  const queryParams = queryString.parse(location.search);
  const from = (queryParams?.from ?? '') as string;

  return {
    template_id: detail?.meta_info.id || '',
    entity_id: detail?.meta_info.entity_id || '',
    template_name: detail?.meta_info.name || '',
    template_type: convertTemplateType(detail?.meta_info.entity_type),
    ...(detail?.meta_info.entity_type === ProductEntityType.ProjectTemplate && {
      entity_copy_id: detail?.project_extra?.template_project_id,
    }),

    template_tag_professional: detail?.meta_info.is_professional
      ? 'professional'
      : 'basic',
    ...(detail?.meta_info?.is_free
      ? ({
          template_tag_prize: 'free',
        } as const)
      : ({
          template_tag_prize: 'paid',
          template_prize_detail: Number(detail?.meta_info?.price?.amount) || 0,
        } as const)),
    from,
  } as const;
}
