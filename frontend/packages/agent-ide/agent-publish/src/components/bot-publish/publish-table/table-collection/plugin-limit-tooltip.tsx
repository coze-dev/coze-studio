/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type FC } from 'react';

import {
  transPricingRules,
  usePluginLimitModal,
} from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';
import { type PluginPricingRule } from '@coze-arch/bot-api/plugin_develop';

// release page tip
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
