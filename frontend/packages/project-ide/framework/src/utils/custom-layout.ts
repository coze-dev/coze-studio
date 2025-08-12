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

import {
  type ApplicationShell,
  createBoxLayout,
  type BoxLayout,
  createSplitLayout,
  SplitPanel,
  BoxPanel,
} from '@coze-project-ide/client';

export const customLayout = (
  shell: ApplicationShell,
  uiBuilderPanel: BoxPanel,
): BoxLayout => {
  const bottomSplitLayout = createSplitLayout([shell.mainPanel], [1], {
    orientation: 'vertical',
    spacing: 0,
  });
  shell.bottomSplitLayout = bottomSplitLayout;
  const middleContentPanel = new SplitPanel({ layout: bottomSplitLayout });

  const leftRightSplitLayout = createBoxLayout(
    [
      // Unretractable bar on the left
      shell.primarySidebar,
      middleContentPanel,
    ],
    [0, 1],
    {
      direction: 'left-to-right',
      spacing: 6,
    },
  );
  const mainDockPanel = new BoxPanel({ layout: leftRightSplitLayout });

  const centerLayout = createBoxLayout(
    [mainDockPanel, uiBuilderPanel, shell.secondarySidebar],
    [1, 0, 0],
    {
      direction: 'left-to-right',
    },
  );
  const centerPanel = new BoxPanel({ layout: centerLayout });

  return createBoxLayout([shell.topPanel, centerPanel], [0, 1], {
    direction: 'top-to-bottom',
    spacing: 0,
  });
};
