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
