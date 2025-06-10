import { useCallback } from 'react';

import { TraceIconButton } from '@coze-workflow/test-run';

import { useOpenTraceListPanel } from '@/hooks';

export const OpenTraceButton = () => {
  const { open } = useOpenTraceListPanel();

  const handleOpenTraceBottomSheet = useCallback(() => {
    open();
  }, [open]);

  return <TraceIconButton onClick={handleOpenTraceBottomSheet} />;
};
