import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze/coze-design/icons';
import { EmptyState } from '@coze/coze-design';

export function EmptySkill() {
  return (
    <div className="flex justify-center pt-[13px] pb-[3px]">
      <EmptyState
        icon={<IconCozEmpty />}
        size="default"
        title={I18n.t('wf_chatflow_155')}
      ></EmptyState>
    </div>
  );
}
