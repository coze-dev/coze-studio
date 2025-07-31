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
  VariableFieldKeyRenameService,
  type VariablePluginOptions,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableFacadeService } from '../workflow-variable-facade-service';
import { WrapArrayExpression } from './wrap-array-expression';
import { MergeGroupExpression } from './merge-group-expression';
import { ExtendBaseType } from './extend-base-type';
import { CustomKeyPathExpression } from './custom-key-path-expression';
import { CustomArrayType } from './custom-array-type';

export const extendASTNodes: VariablePluginOptions['extendASTNodes'] = [
  [
    CustomKeyPathExpression,
    ctx => ({
      facadeService: ctx.get(WorkflowVariableFacadeService),
      renameService: ctx.get(VariableFieldKeyRenameService),
    }),
  ],
  [
    WrapArrayExpression,
    ctx => ({
      facadeService: ctx.get(WorkflowVariableFacadeService),
      renameService: ctx.get(VariableFieldKeyRenameService),
    }),
  ],
  CustomArrayType,
  ExtendBaseType,
  MergeGroupExpression,
];
