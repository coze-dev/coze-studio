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
  createPreviewContextMenuItemFeatureRegistry,
  type PreviewContextMenuItemRegistry,
} from '@/text-knowledge-editor/features/preview-context-menu-items/registry';
import { EditAction } from '@/text-knowledge-editor/features/preview-context-menu-items/edit-action';
import { DeleteAction } from '@/text-knowledge-editor/features/preview-context-menu-items/delete-action';
export const previewContextMenuItemsContributes: PreviewContextMenuItemRegistry =
  (() => {
    const previewContextMenuItemFeatureRegistry =
      createPreviewContextMenuItemFeatureRegistry('preview-context-menu-items');
    previewContextMenuItemFeatureRegistry.registerSome([
      {
        type: 'edit',
        module: {
          Component: EditAction,
        },
      },
      {
        type: 'delete',
        module: {
          Component: DeleteAction,
        },
      },
    ]);
    return previewContextMenuItemFeatureRegistry;
  })();
