import { PublicScopeProvider } from '@coze-workflow/variable';
import { NLPromptButton } from '@coze-workflow/resources-adapter';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';
import { I18n } from '@coze-arch/i18n';
import { UIIconButton, Tooltip } from '@coze-arch/bot-semi';
import {
  IconCozExpand,
  IconCozKnowledge,
  IconCozMinimize,
} from '@coze-arch/coze-design/icons';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';

import { ExpandSheetEditor } from './expand-sheet-editor';

import styles from './index.module.less';

const DISABLED_OPICITY = 0.5;

export const PromptKitBar = props => {
  const { openPromptLibrary, readonly } = props;
  const { fullscreenPanel, setFullscreenPanel } = useNodeFormPanelState();
  const fullscreenPanelVisible = !!fullscreenPanel;

  const handleExpandClick = () => {
    setFullscreenPanel(
      fullscreenPanelVisible ? null : (
        <PublicScopeProvider>
          <PromptEditorProvider>
            <ExpandSheetEditor {...props} />
          </PromptEditorProvider>
        </PublicScopeProvider>
      ),
    );
  };

  return (
    <div
      className={`flex justify-between items-center gap-[8px] h-[28px] ${styles['kit-button-container']}`}
    >
      <Tooltip content={I18n.t('workflow_prompt_editor_view_library')}>
        <UIIconButton
          onClick={e => {
            e.stopPropagation();
            openPromptLibrary();
          }}
          icon={
            <IconCozKnowledge
              color={`rgba(107, 109, 117, ${readonly ? DISABLED_OPICITY : 1})`}
            />
          }
          disabled={readonly}
        />
      </Tooltip>

      <Tooltip
        content={I18n.t(
          fullscreenPanelVisible ? 'collapse' : 'workflow_prompt_editor_expand',
        )}
      >
        <UIIconButton
          onClick={handleExpandClick}
          icon={
            fullscreenPanelVisible ? (
              <IconCozMinimize color="#6B6D75" />
            ) : (
              <IconCozExpand color="#6B6D75" />
            )
          }
          color="#6B6D75"
        />
      </Tooltip>

      <Tooltip content={I18n.t('prompt_optimization_button_hover_tooltip')}>
        <div>
          <NLPromptButton
            disabled={readonly}
            onlyIcon
            className="!h-6 !p-1 !rounded-lg"
            style={{ minWidth: '24px' }}
          />
        </div>
      </Tooltip>
    </div>
  );
};
