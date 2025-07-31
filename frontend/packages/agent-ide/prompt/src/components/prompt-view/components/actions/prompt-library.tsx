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
import { useEditor } from '@coze-common/prompt-kit-base/editor';
import { type EditorAPI } from '@coze-common/prompt-kit-base/editor';
import { usePromptLibraryModal } from '@coze-common/prompt-kit';
import { SpaceType } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozLightbulb } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
export const PromptLibrary = (props: {
  readonly: boolean;
  enableDiff: boolean;
}) => {
  const { readonly, enableDiff = true } = props;
  const editor = useEditor<EditorAPI>();
  const { spaceId, botId } = useBotInfoStore(
    useShallow(state => ({
      spaceId: state.space_id,
      botId: state.botId,
    })),
  );
  const spaceType = useSpaceStore(state => state.space.space_type);
  const enterDiffMode = useDiffTaskStore(state => state.enterDiffMode);
  const {
    open,
    node: PromptLibraryModal,
    close,
  } = usePromptLibraryModal({
    spaceId,
    botId,
    defaultActiveTab: 'Recommended',
    isPersonal: spaceType === SpaceType.Personal,
    editor: editor as EditorAPI,
    source: 'bot_detail_page',
    enableDiff,
    onDiff: ({ prompt }) => {
      enterDiffMode({
        diffTask: 'prompt',
        promptDiffInfo: {
          diffPromptResourceId: '',
          diffMode: 'new-diff',
          diffPrompt: prompt,
        },
      });
      close();
    },
  });
  return (
    <div>
      <Tooltip content={I18n.t('prompt_library_prompt_library')}>
        <IconButton
          data-testid="bot.ide.prompt_resource"
          icon={<IconCozLightbulb className="text-xxl !coz-fg-primary" />}
          color="secondary"
          onClick={() => {
            open();
          }}
          disabled={readonly}
        />
      </Tooltip>
      {PromptLibraryModal}
    </div>
  );
};
