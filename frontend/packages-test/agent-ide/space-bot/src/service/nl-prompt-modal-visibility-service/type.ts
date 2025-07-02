import { type sendTeaEvent } from '@coze-arch/bot-tea';
import { type NLPromptModalAction } from '@coze-agent-ide/bot-editor-context-store';

export interface NLPromptModalVisibilityProps {
  setVisible: NLPromptModalAction['setVisible'];
  updateModalPosition: NLPromptModalAction['updatePosition'];
  getIsVisible: () => boolean;
  sendTeaEvent: typeof sendTeaEvent;
}
