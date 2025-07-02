import type { FC } from 'react';

import { I18n } from '@coze-arch/i18n';

export const DSLPlaceholer: FC = () => (
  <div
    className="flex items-center justify-center rounded-lg coz-bg-plus text-center text-xs font-medium coz-fg-secondary "
    style={{ height: 58 }}
  >
    {I18n.t('shortcut_modal_components')}
  </div>
);
