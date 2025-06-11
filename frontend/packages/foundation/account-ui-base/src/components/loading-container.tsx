import { type FC } from 'react';

import { Spin } from '@coze-arch/bot-semi';

export const LoadingContainer: FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Spin spinning style={{ height: '100%', width: '100%' }} />
  </div>
);
