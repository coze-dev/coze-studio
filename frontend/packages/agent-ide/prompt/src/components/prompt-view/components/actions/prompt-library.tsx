import { useShallow } from 'zustand/react/shallow';
import { useDiffTaskStore } from '@coze-studio/bot-detail-store/diff-task';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { SpaceType } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozLightbulb } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useEditor } from '@coze-common/prompt-kit-base/editor';
import { type EditorAPI } from '@coze-common/prompt-kit-base/editor';
import { usePromptLibraryModal } from '@coze-common/prompt-kit';
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
