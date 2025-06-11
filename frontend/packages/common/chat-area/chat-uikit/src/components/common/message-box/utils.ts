import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';

import { type MessageBoxInnerVariantProps } from '../../../variants/message-box-inner-variants';
import { type MessageBoxTheme } from './type';

export const getMessageBoxInnerVariantsByTheme: (props: {
  theme: MessageBoxTheme;
}) => Pick<MessageBoxInnerVariantProps, 'color' | 'border' | 'tight'> = ({
  theme,
}) => {
  if (theme === 'primary' || theme === 'whiteness' || theme === 'grey') {
    return { color: theme, border: null, tight: false };
  }
  if (theme === 'colorful') {
    return { color: 'primary', border: null, tight: false };
  }
  if (theme === 'border') {
    return { color: 'whiteness', border: 'primary', tight: true };
  }

  if (theme === 'color-border') {
    return { color: 'whiteness', border: 'highlight', tight: false };
  }
  if (theme === 'color-border-card') {
    return { color: 'whiteness', border: 'highlight', tight: true };
  }
  if (theme === 'none') {
    return { tight: true, color: null, border: null };
  }
  exhaustiveCheckSimple(theme);
  return { tight: false, color: null, border: null };
};
