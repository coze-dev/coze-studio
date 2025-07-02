import { forwardRef } from 'react';

import {
  UISearch as SemiUISearch,
  type UISearchProps,
} from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

export { type UISearchProps };

export const UISearch = forwardRef<HTMLInputElement, UISearchProps>(
  (props, ref) => (
    <SemiUISearch ref={ref} placeholder={I18n.t('Search')} {...props} />
  ),
);
