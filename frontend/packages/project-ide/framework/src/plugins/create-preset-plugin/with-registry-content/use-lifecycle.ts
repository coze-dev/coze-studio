import { useEffect, useCallback } from 'react';

import {
  ApplicationShell,
  ContextKeyService,
  type ReactWidget,
  useIDEService,
} from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { type RegistryHandler } from '@/types';
import { type WidgetContext } from '@/context/widget-context';

import { LifecycleService } from '../lifecycle-service';

export const useLifeCycle = (
  registry: RegistryHandler,
  widgetContext: WidgetContext,
  widget?: ReactWidget,
) => {
  const lifecycleService = useIDEService<LifecycleService>(LifecycleService);
  const contextKeyService = useIDEService<ContextKeyService>(ContextKeyService);
  const setContextKey = useCallback(() => {
    registry?.onFocus?.(widgetContext);
    contextKeyService.setContext('widgetFocus', widget?.uri);
    contextKeyService.setContext('widgetContext', widgetContext);
  }, [widgetContext]);
  const shell = useIDEService<ApplicationShell>(ApplicationShell);
  // 生命周期管理
  useEffect(() => {
    const currentUri = (shell.mainPanel.currentTitle?.owner as ProjectIDEWidget)
      ?.uri;
    if (currentUri && widget?.uri?.match(currentUri)) {
      setContextKey();
    }
    const listenActivate = lifecycleService.onFocus(title => {
      if (
        (title.owner as ReactWidget).uri?.toString() === widget?.uri?.toString()
      ) {
        setContextKey();
      }
    });
    const listenDispose = widget?.onDispose?.(() => {
      registry?.onDispose?.(widgetContext);
    });
    return () => {
      listenActivate?.dispose?.();
      listenDispose?.dispose?.();
    };
  }, []);
};
