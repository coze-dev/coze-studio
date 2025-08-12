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

import { WidgetType } from '@codemirror/view';

import type { InputVariableInfo, RangeType } from './types';

import s from './index.module.less';

export class VariableSubfixWidget extends WidgetType {
  constructor(
    protected range: RangeType,
    protected variableContext: {
      varaibleInfo: InputVariableInfo;
      isDarkTheme?: boolean;
      noLabel?: boolean;
    },
    protected openList?: (range: RangeType) => void,
  ) {
    super();
  }

  // Insert variable block dom in editor
  toDOM() {
    const node = document.createElement('span');
    node.classList.add(s.content);
    // Global variable cursor style
    if (this.variableContext.varaibleInfo.globalVariableKey) {
      node.classList.add(s['pointer-content']);
    }
    if (!this.variableContext.varaibleInfo.isValid) {
      node.classList.add(s['error-content']);
    }
    if (this.variableContext?.isDarkTheme) {
      node.classList.add(s['dark-suffix']);
    }
    node.onclick = () => {
      this.openList?.(this.range);
    };
    if (!this.variableContext?.noLabel) {
      node.innerText = this.variableContext.varaibleInfo
        .parsedKeyPath as string;
    } else {
      node.classList.add(s['variable-suffix']);
    }
    return node;
  }

  eq(other: VariableSubfixWidget) {
    return (
      this.range.from === other.range.from &&
      this.range.to === other.range.to &&
      this.variableContext.varaibleInfo ===
        other.variableContext.varaibleInfo &&
      this.variableContext?.noLabel === other.variableContext?.noLabel &&
      this.variableContext?.isDarkTheme === other.variableContext?.isDarkTheme
    );
  }
}
