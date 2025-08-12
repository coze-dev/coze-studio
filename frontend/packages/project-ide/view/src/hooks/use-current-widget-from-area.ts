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
