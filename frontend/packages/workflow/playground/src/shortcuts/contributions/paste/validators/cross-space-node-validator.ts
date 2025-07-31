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

import { StandardNodeType } from '@coze-workflow/base';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class CrossSpaceNodeValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node } = context;

    // Nodes that do not allow cross-spatial replication
    if (
      [
        StandardNodeType.Dataset,
        StandardNodeType.DatasetWrite,
        StandardNodeType.Database,
        StandardNodeType.DatabaseQuery,
        StandardNodeType.DatabaseCreate,
        StandardNodeType.DatabaseUpdate,
        StandardNodeType.DatabaseDelete,
        StandardNodeType.SubWorkflow,
        StandardNodeType.Imageflow,
      ].includes(node.type as StandardNodeType)
    ) {
      return false;
    }

    return null;
  }
}
