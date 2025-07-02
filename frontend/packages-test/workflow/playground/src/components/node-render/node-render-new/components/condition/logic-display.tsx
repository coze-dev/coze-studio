import { type FC } from 'react';

import { ConditionLogic } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

export const LogicDisplay: FC<{
  logic: ConditionLogic;
}> = ({ logic }) => (
  <div className="relative text-center py-1">
    <div className="absolute top-[50%] -mt-[1px] coz-stroke-primary w-full border-0 border-b border-solid" />
    <span className="min-w-[28px] relative inline-block coz-bg-max">
      {logic === ConditionLogic.AND
        ? I18n.t('workflow_detail_condition_and')
        : I18n.t('workflow_detail_condition_or')}
    </span>
  </div>
);
