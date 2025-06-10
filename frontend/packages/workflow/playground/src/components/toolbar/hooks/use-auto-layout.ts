import { useCallback } from 'react';

import {
  usePlaygroundTools,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowLayoutShortcutsContribution } from '@/shortcuts';

export const useAutoLayout = () => {
  const tools = usePlaygroundTools();
  const autoLayoutShortcut = useService(WorkflowLayoutShortcutsContribution);
  const autoLayout = useCallback(async () => {
    tools.fitView();
    await autoLayoutShortcut.autoLayout();
    tools.fitView();
  }, [tools, autoLayoutShortcut]);
  return autoLayout;
};
