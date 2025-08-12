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

import { UploadImageMenu } from '@/text-knowledge-editor/features/editor-actions/upload-image';
import {
  createEditorActionFeatureRegistry,
  type EditorActionRegistry,
} from '@/text-knowledge-editor/features/editor-actions/registry';
export const editorContextActionRegistry: EditorActionRegistry = (() => {
  const editorContextActionFeatureRegistry = createEditorActionFeatureRegistry(
    'editor-context-actions',
  );
  editorContextActionFeatureRegistry.registerSome([
    {
      type: 'upload-image',
      module: {
        Component: UploadImageMenu,
      },
    },
  ]);
  return editorContextActionFeatureRegistry;
})();
