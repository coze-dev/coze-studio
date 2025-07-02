import { useCallback } from 'react';

import { LayoutPanelKey } from '@/constants';

import { useFloatLayoutService } from './use-float-layout-service';

interface OpenOptions {
  defaultTab?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const useOpenTraceListPanel = () => {
  const floatLayoutService = useFloatLayoutService();

  const open = useCallback(
    (options?: OpenOptions) => {
      floatLayoutService.open(LayoutPanelKey.TraceList, 'bottom', options);
    },
    [floatLayoutService],
  );

  return { open };
};
