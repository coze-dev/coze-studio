/* eslint-disable @typescript-eslint/no-explicit-any */
import { type PropsWithChildren } from 'react';

import { type TokenAndCost } from '@coze-workflow/base/api';

import { CostPopover } from '../../cost-popover';

export const TestRunCostPopover = ({
  tokenAndCost,
  children,
  popoverProps,
  className,
}: PropsWithChildren<{
  tokenAndCost: TokenAndCost;
  className?: string;
  popoverProps?: Record<string, any>;
}>) => {
  const data = {
    output: {
      token: tokenAndCost.outputTokens || '-',
      cost: tokenAndCost.outputCost || '-',
    },
    input: {
      token: tokenAndCost.inputTokens || '-',
      cost: tokenAndCost.inputCost || '-',
    },
    total: {
      token: tokenAndCost.totalTokens || '-',
      cost: tokenAndCost.totalCost || '-',
    },
  };

  return (
    <CostPopover popoverProps={popoverProps} data={data} className={className}>
      {children}
    </CostPopover>
  );
};
