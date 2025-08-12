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
  // Life Cycle Management
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
