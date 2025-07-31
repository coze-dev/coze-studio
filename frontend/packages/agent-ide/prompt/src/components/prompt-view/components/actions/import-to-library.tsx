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

import { useShallow } from 'zustand/react/shallow';
import { useDiffTaskStore } from '@coze-studio/bot-detail-store/diff-task';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrayArrowUp } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { useEditor } from '@coze-common/prompt-kit-base/editor';
import { type EditorAPI } from '@coze-common/prompt-kit-base/editor';
import { usePromptConfiguratorModal } from '@coze-common/prompt-kit-adapter/create-prompt';
export const ImportToLibrary = (props: {
  readonly: boolean;
  enableDiff: boolean;
}) => {
  const { readonly, enableDiff = true } = props;
  const { spaceId, botId } = useBotInfoStore(
    useShallow(state => ({
      spaceId: state.space_id,
      botId: state.botId,
    })),
  );
  const enterDiffMode = useDiffTaskStore(state => state.enterDiffMode);
  const editor = useEditor<EditorAPI>();
  const { open: openCreatePrompt, node: promptConfiguratorModal } =
    usePromptConfiguratorModal({
      spaceId,
      enableDiff,
      source: 'bot_detail_page',
      botId,
      onDiff: ({ prompt }) => {
        enterDiffMode({
          diffTask: 'prompt',
          promptDiffInfo: {
            diffPromptResourceId: '',
            diffMode: 'new-diff',
            diffPrompt: prompt,
          },
        });
      },
    });
  return (
    <div>
      <Tooltip content={I18n.t('compare_tooltips_submit_to_the_prompt')}>
        <IconButton
          color="secondary"
          icon={<IconCozTrayArrowUp className="!text-xxl !coz-fg-primary" />}
          onClick={() =>
            openCreatePrompt({
              mode: 'create',
              defaultPrompt: editor?.getValue(),
            })
          }
          disabled={readonly}
        />
      </Tooltip>
      {promptConfiguratorModal}
    </div>
  );
};
