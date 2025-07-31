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

import { AddButton as BaseAddButton } from '@coze-agent-ide/tool';
import { I18n } from '@coze-arch/i18n';

interface AddButtonProps {
  /** Click to create a workflow */
  onCreate: () => void;

  /** Click to import workflow */
  onImport: () => void;
}

export const AddButton = ({ onCreate, onImport }: AddButtonProps) => (
  <BaseAddButton
    tooltips={I18n.t('bot_edit_workflow_add_tooltip')}
    onClick={() => {
      onImport();
    }}
    enableAutoHidden={true}
    data-testid={'bot.editor.tool.workflow.add-button'}
  />
);
