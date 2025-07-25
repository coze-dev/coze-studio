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

  // 右边分屏不展示 hover icon
  if (children?.length === 1) {
    return undefined;
  } else if (currentTabIndex === 1) {
    return 'right';
  } else {
    return 'left';
  }
};

/**
 * 获取当前 uri 的资源在哪个分屏下
 * left: 左边分屏
 * right: 右边分屏
 * undefined: 未分屏
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
      // 本次 uri 是否在当前 tab，不是不执行
      // 分屏过程中会出现中间态，布局变更时盲目执行会导致时序异常问题
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
