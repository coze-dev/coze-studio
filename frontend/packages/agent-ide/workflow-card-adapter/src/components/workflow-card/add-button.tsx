import { AddButton as BaseAddButton } from '@coze-agent-ide/tool';
import { I18n } from '@coze-arch/i18n';

interface AddButtonProps {
  /** 点击创建工作流 */
  onCreate: () => void;

  /** 点击导入工作流 */
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
