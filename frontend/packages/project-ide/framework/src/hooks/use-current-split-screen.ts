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

import { useEffect, useState } from 'react';

import {
  ApplicationShell,
  useIDEService,
  type URI,
  type DockLayout,
  type ReactWidget,
  type TabBar,
  type Widget,
} from '@coze-project-ide/client';

import { compareURI } from '@/utils';

type Area = 'left' | 'right';

const getTabArea = (shell: ApplicationShell, uri?: URI): Area | undefined => {
  let currentTabIndex = -1;
  const area = (shell.mainPanel?.layout as DockLayout)?.saveLayout?.().main;
  const children = (area as DockLayout.ISplitAreaConfig)?.children || [area];

  children.forEach((child, idx) => {
    const containCurrent =
      uri &&
      ((child as DockLayout.ITabAreaConfig)?.widgets || []).some(
        widget => (widget as ReactWidget).uri?.toString?.() === uri.toString(),
      );
    if (containCurrent) {
      currentTabIndex = idx;
    }
  });

  // The split screen on the right does not show the hover icon.
  if (children?.length === 1) {
    return undefined;
  } else if (currentTabIndex === 1) {
    return 'right';
  } else {
    return 'left';
  }
};

/**
 * Get the resource of the current URI under which split screen
 * Left: Left split screen
 * Right: right split screen
 * Undefined: not split screen
 */
export const useSplitScreenArea = (
  uri?: URI,
  tabBar?: TabBar<Widget>,
): Area | undefined => {
  const shell = useIDEService<ApplicationShell>(ApplicationShell);

  const [area, setArea] = useState(getTabArea(shell, uri));

  useEffect(() => {
    setArea(getTabArea(shell, uri));
    const listener = () => {
      // Is this URI in the current tab, not not executed
      // There will be an intermediate state during the split-screen process, and blind execution when the layout is changed will lead to abnormal timing problems
      const uriInCurrentTab = tabBar?.titles.some(title =>
        compareURI((title.owner as ReactWidget)?.uri, uri),
      );
      if (uriInCurrentTab) {
        setArea(getTabArea(shell, uri));
      }
    };
    shell.mainPanel.layoutModified.connect(listener);
    return () => {
      shell.mainPanel.layoutModified.disconnect(listener);
    };
  }, [uri?.toString?.()]);

  return area;
};
