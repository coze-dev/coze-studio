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

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { InsertInputSlotAction } from '@coze-common/editor-plugins/actions';
import { ActionBar } from '@coze-common/editor-plugins/action-bar';
import { ActiveLinePlaceholder } from '@coze-common/prompt-kit-base/editor';
import {
  PromptView as BaseComponent,
  ImportToLibrary,
  PromptLibrary,
  type PromptViewProps as BaseProps,
} from '@coze-agent-ide/prompt';
export type PromptViewProps = Omit<BaseProps, 'actionButton'>;

export const PromptView: React.FC<PromptViewProps> = (...props) => {
  const isReadonly = useBotDetailIsReadonly();
  return (
    <BaseComponent
      {...props}
      actionButton={
        <div className="flex items-center gap-[6px]">
          {!isReadonly ? (
            <>
              <ImportToLibrary readonly={isReadonly} enableDiff={false} />
              <PromptLibrary readonly={isReadonly} enableDiff={false} />
            </>
          ) : null}
        </div>
      }
      editorExtensions={
        <>
          <ActionBar>
            <InsertInputSlotAction />
          </ActionBar>
          <ActiveLinePlaceholder>
            {I18n.t('agent_prompt_editor_insert_placeholder', {
              keymap: '{',
            })}
          </ActiveLinePlaceholder>
        </>
      }
    />
  );
};
