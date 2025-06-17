import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
interface PromptDiffProps {
  mode: 'info' | 'edit' | 'create';
  editor?: EditorAPI;
  spaceId: string;
  botId?: string;
  projectId?: string;
  workflowId?: string;
  source: string;
  submitFun?: (
    e: React.MouseEvent<Element, MouseEvent>,
  ) => Promise<{ mode: string; id: string } | undefined>;
  editId?: string;
  onDiff?: ({
    prompt,
    libraryId,
  }: {
    prompt: string;
    libraryId: string;
  }) => void;
  onCancel?: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

export const PromptDiff = ({
  mode,
  editor,
  spaceId,
  botId,
  projectId,
  workflowId,
  source,
  submitFun,
  editId,
  onDiff,
  onCancel,
}: PromptDiffProps) => {
  if (mode === 'info') {
    return (
      <Button
        color="primary"
        onClick={e => {
          if (!editId) {
            return;
          }
          onDiff?.({ prompt: editor?.getValue() ?? '', libraryId: editId });
          sendTeaEvent(EVENT_NAMES.compare_mode_front, {
            source,
            space_id: spaceId,
            action: 'start',
            compare_type: 'prompts',
            bot_id: botId,
            from: 'prompt_resource',
            project_id: projectId,
            workflow_id: workflowId,
          });
          onCancel?.(e);
        }}
      >
        {I18n.t('compare_prompt_compare_debug')}
      </Button>
    );
  }

  return (
    <Button
      color="primary"
      onClick={async e => {
        const res = await submitFun?.(e);
        if (res?.id) {
          onDiff?.({ prompt: editor?.getValue() ?? '', libraryId: res.id });
          sendTeaEvent(EVENT_NAMES.compare_mode_front, {
            source,
            space_id: spaceId,
            action: 'start',
            compare_type: 'prompts',
            bot_id: botId,
            from: 'prompt_resource',
            project_id: projectId,
            workflow_id: workflowId,
          });
        }
        onCancel?.(e);
      }}
    >
      {I18n.t('creat_prompt_button_comfirm_and_compare')}
    </Button>
  );
};
