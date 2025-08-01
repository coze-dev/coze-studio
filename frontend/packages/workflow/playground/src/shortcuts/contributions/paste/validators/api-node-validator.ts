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

import type { ApiNodeData } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';
import { PluginProductStatus } from '@coze-arch/idl/developer_api';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class ApiNodeValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node } = context;

    if (node.type !== StandardNodeType.Api) {
      return null;
    }

    // Cross-spatial copying of unshelved plug-in nodes is not allowed
    const apiNodeData = node._temp.externalData as ApiNodeData;
    const isListed =
      apiNodeData?.pluginProductStatus === PluginProductStatus.Listed;
    return isListed;
  }
}
