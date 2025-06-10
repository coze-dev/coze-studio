import React, { useEffect, useMemo, useState } from 'react';

import { usePluginLimitModal } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { IconCozCoin } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';
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
