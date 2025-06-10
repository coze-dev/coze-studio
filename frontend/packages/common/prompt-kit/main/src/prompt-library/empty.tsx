import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze/coze-design/icons';
import { EmptyState } from '@coze/coze-design';

import EmptyPromptIcon from '../assets/empty-prompt-icon.svg';

export const UnselectedPrompt = (props: { className?: string }) => (
  <div className={props.className}>
    <EmptyState
      title={I18n.t('prompt_library_unselected')}
      icon={<img src={EmptyPromptIcon} alt="empty-prompt" />}
    />
  </div>
);

export const EmptyPrompt = (props: { className?: string }) => (
  <div className={props.className}>
    <EmptyState
      title={I18n.t('prompt_library_prompt_empty')}
      icon={<IconCozEmpty />}
    />
  </div>
);
