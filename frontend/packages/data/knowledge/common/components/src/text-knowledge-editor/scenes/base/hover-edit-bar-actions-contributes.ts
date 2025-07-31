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
  createHoverEditBarActionFeatureRegistry,
  type HoverEditBarActionRegistry,
} from '@/text-knowledge-editor/features/hover-edit-bar-actions/registry';
import { EditAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/edit-action';
import { DeleteAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/delete-action';
import { AddBeforeAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/add-before-action';
import { AddAfterAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/add-after-action';
export const hoverEditBarActionsContributes: HoverEditBarActionRegistry =
  (() => {
    const hoverEditBarActionFeatureRegistry =
      createHoverEditBarActionFeatureRegistry('hover-edit-bar-actions');
    hoverEditBarActionFeatureRegistry.registerSome([
      {
        type: 'edit',
        module: {
          Component: EditAction,
        },
      },
      {
        type: 'add-before',
        module: {
          Component: AddBeforeAction,
        },
      },
      {
        type: 'add-after',
        module: {
          Component: AddAfterAction,
        },
      },
      {
        type: 'delete',
        module: {
          Component: DeleteAction,
        },
      },
    ]);
    return hoverEditBarActionFeatureRegistry;
  })();
