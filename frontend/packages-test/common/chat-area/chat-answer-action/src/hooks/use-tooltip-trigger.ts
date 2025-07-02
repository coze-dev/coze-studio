import { useChatAreaLayout } from '@coze-common/chat-area/hooks/public/common';
import { Layout } from '@coze-common/chat-uikit-shared';

export const useTooltipTrigger = (
  defaultTrigger: 'hover' | 'click' | 'focus' | 'contextMenu',
) => {
  const layout = useChatAreaLayout();
  if (layout === Layout.MOBILE) {
    return 'custom';
  }
  return defaultTrigger;
};
