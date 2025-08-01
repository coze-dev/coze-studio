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

import React, { useEffect, useMemo, useState } from 'react';

import { usePluginLimitModal } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { IconCozCoin } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { UIButton } from '@coze-arch/bot-semi';

import { usePluginCredits } from '@/components/workflow-header/hooks';

const TOOLTIP_DELAY_TIME = 3000;

export const CreditButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const { credits } = usePluginCredits();
  const showCreditButton = useMemo(() => credits.length > 0, [credits]);

  useEffect(() => {
    if (showCreditButton) {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, TOOLTIP_DELAY_TIME);
    } else {
      setShowTooltip(false);
    }
  }, [showCreditButton]);
  const { node, open } = usePluginLimitModal({
    content: (
      <div>
        {I18n.t('professional_plan_n_paid_plugins_included_in_workflow', {
          count: credits.length,
        })}
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataSource: credits as any,
  });

  if (!showCreditButton) {
    return null;
  }
  return (
    <>
      {node}
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Tooltip
          visible={showTooltip}
          trigger="custom"
          position="bottom"
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
          content={I18n.t('plugins_with_limited_calls_added_tip')}
        >
          <UIButton type="secondary" icon={<IconCozCoin />} onClick={open} />
        </Tooltip>
      </div>
    </>
  );
};
