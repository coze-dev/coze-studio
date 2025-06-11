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
