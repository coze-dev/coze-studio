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
  type Widget,
  BoxPanel,
  BoxLayout,
  SplitLayout,
  SplitPanel,
} from '../lumino/widgets';

export const createBoxLayout = (
  widgets: Widget[],
  stretch?: number[],
  options?: BoxPanel.IOptions,
): BoxLayout => {
  const boxLayout = new BoxLayout(options);
  for (let i = 0; i < widgets.length; i++) {
    if (stretch !== undefined && i < stretch.length) {
      BoxPanel.setStretch(widgets[i], stretch[i]);
    }
    boxLayout.addWidget(widgets[i]);
  }
  return boxLayout;
};

export const createSplitLayout = (
  widgets: Widget[],
  stretch?: number[],
  options?: Partial<SplitLayout.IOptions>,
): SplitLayout => {
  let optParam: SplitLayout.IOptions = {
    renderer: SplitPanel.defaultRenderer,
  };
  if (options) {
    optParam = { ...optParam, ...options };
  }
  const splitLayout = new SplitLayout(optParam);
  for (let i = 0; i < widgets.length; i++) {
    if (stretch !== undefined && i < stretch.length) {
      SplitPanel.setStretch(widgets[i], stretch[i]);
    }
    splitLayout.addWidget(widgets[i]);
  }
  return splitLayout;
};
