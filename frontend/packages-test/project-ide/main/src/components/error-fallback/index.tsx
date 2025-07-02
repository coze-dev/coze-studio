import React from 'react';

import { IconCozIllusError } from '@coze-arch/coze-design/illustrations';
import { EmptyState } from '@coze-arch/coze-design';

export const ErrorFallback = () => (
  <EmptyState
    size="full_screen"
    icon={<IconCozIllusError />}
    title="An error occurred"
    description="Please try again later."
  />
);
