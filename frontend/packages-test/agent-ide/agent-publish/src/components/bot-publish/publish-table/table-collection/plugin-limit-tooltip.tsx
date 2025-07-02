import { type FC } from 'react';

import {
  transPricingRules,
  usePluginLimitModal,
} from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';
import { type PluginPricingRule } from '@coze-arch/bot-api/plugin_develop';

// 发布页提示
export const PluginPricingInfo: FC<{
  pluginPricingRules?: Array<PluginPricingRule>;
}> = ({ pluginPricingRules }) => {
  const pricingRules = transPricingRules(pluginPricingRules);

  const { node, open } = usePluginLimitModal({
    // @ts-expect-error - skip
    dataSource: pricingRules,
    content: (
      <div>
        {I18n.t('professional_plan_n_paid_plugins_included_in_bot', {
          count: pricingRules.length,
        })}
      </div>
    ),
  });

  if (pricingRules.length === 0) {
    return null;
  }

  return (
    <>
      {node}
      <div className="pr-[24px] flex justify-end items-center gap-[6px]">
        {I18n.t('plugins_with_limited_calls_added_tip')}
        <Typography.Text className="font-bold" link size="small" onClick={open}>
          {I18n.t('plugin_usage_limits_modal_view_details')}
        </Typography.Text>
      </div>
    </>
  );
};
