import { type PropsWithChildren, useRef } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { AIButton, type ButtonProps } from '@coze-arch/coze-design';

import { usePromptEditor } from '../../context/editor-kit';
import { useBotEditorService } from '../../context/bot-editor-service';

export const NLPromptButton: React.FC<PropsWithChildren<ButtonProps>> = ({
  children,
  ...buttonProps
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { nLPromptModalVisibilityService } = useBotEditorService();
  const { promptEditor } = usePromptEditor();
  const isReadonly = useBotDetailIsReadonly();

  const isDisabled = !promptEditor || isReadonly;

  const onClick = () => {
    if (!ref.current) {
      return;
    }
    const { offsetHeight, offsetTop } = ref.current;
    const { top, left } = ref.current.getBoundingClientRect();
    nLPromptModalVisibilityService.open(
      {
        top: top + offsetHeight,
        left: left + offsetTop,
      },
      'ai-button',
    );
  };
  return (
    <div ref={ref}>
      <AIButton
        color="aihglt"
        iconPosition="left"
        size="small"
        disabled={isDisabled}
        onClick={onClick}
        {...buttonProps}
      >
        {children}
      </AIButton>
    </div>
  );
};
