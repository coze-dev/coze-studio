import { useEffect } from 'react';

import { useIDEService, useRefresh } from '@coze-project-ide/core';

import { type ReactWidget } from '../widget/react-widget';
import { type LayoutPanelType } from '../types';
import { ApplicationShell } from '../shell/application-shell';
export function useCurrentWidgetFromArea<T extends ReactWidget>(
  area: LayoutPanelType.MAIN_PANEL | LayoutPanelType.BOTTOM_PANEL,
): T | undefined {
  const shell = useIDEService<ApplicationShell>(ApplicationShell);
  const refresh = useRefresh();
  useEffect(() => {
    const dispose = shell.onCurrentWidgetChange(() => {
      refresh();
    });
    return () => dispose.dispose();
  }, [shell]);
  return shell.getCurrentWidget(area) as T;
}
