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

import { useCursorInInputSlot } from '@coze-common/editor-plugins/input-slot';
import {
  PromptConfiguratorModal as BasePromptConfiguratorModal,
  type PromptConfiguratorModalProps,
  ImportPromptWhenEmptyPlaceholder,
  useCreatePromptContext,
  InsertInputSlotButton,
} from '@coze-common/prompt-kit-base/create-prompt';

export { usePromptConfiguratorModal } from '@coze-common/prompt-kit-base/create-prompt';

export const PromptConfiguratorModal = (
  props: PromptConfiguratorModalProps,
) => {
  const { isReadOnly } = useCreatePromptContext() || {};
  const inInputSlot = useCursorInInputSlot();
  return (
    <BasePromptConfiguratorModal
      {...props}
      promptSectionConfig={{
        editorPlaceholder: <ImportPromptWhenEmptyPlaceholder />,
        editorActions: <InsertInputSlotButton disabled={inInputSlot} />,
        headerActions: !isReadOnly ? (
          <div className="flex gap-2">
            <div>
              <InsertInputSlotButton disabled={inInputSlot} />
            </div>
          </div>
        ) : null,
      }}
    />
  );
};
