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

import { getIconSvgString } from './utils';
import type { InputVariableInfo, RangeType } from './types';

import s from './index.module.less';

export class VariablePrefixWidget extends WidgetType {
  constructor(
    protected openList: (range: RangeType) => void,
    protected variableContext: {
      nodeName: string;
      varaibleInfo: InputVariableInfo;
      range: {
        from: number;
        to: number;
      };
      isDarkTheme?: boolean;
      languageId?: string;
    },
    protected readonly?: boolean,
  ) {
    super();
  }

  // Insert variable block dom in editor
  toDOM() {
    const { range, varaibleInfo, nodeName, isDarkTheme, languageId } =
      this.variableContext;
    const node = document.createElement('span');
    node.classList.add(s.node);
    if (isDarkTheme) {
      node.classList.add(s.nodeDark);
    }
    node.onclick = () => {
      if (this.readonly) {
        return;
      }
      this.openList(range);
    };

    if (!varaibleInfo.isValid) {
      node.classList.add(s['node-error']);
    }

    let icon: HTMLImageElement | HTMLDivElement;

    if (varaibleInfo?.globalVariableKey) {
      icon = document.createElement('div');
      icon.innerHTML = getIconSvgString(isDarkTheme ? 'white' : '#080D1E')[
        varaibleInfo?.globalVariableKey
      ];
      icon.classList.add(s.svg);
    } else {
      icon = document.createElement('img');
      (icon as HTMLImageElement).src = varaibleInfo?.iconUrl ?? '';
      icon.classList.add(s.image);
    }

    const nodeNamePart = document.createElement('span');
    nodeNamePart.classList.add(s.nodeName);
    nodeNamePart.classList.add(
      languageId === 'json' ? s.jsonLineHeight : s.baseLineHeight,
    );
    nodeNamePart.innerText = varaibleInfo?.nodeTitle ?? nodeName;

    const split = document.createElement('span');
    split.classList.add(s.split);
    split.innerText = '-';

    const wrapper = document.createElement('span');
    wrapper.classList.add(s.wrapper);

    wrapper.appendChild(icon);
    wrapper.appendChild(nodeNamePart);
    wrapper.appendChild(split);

    node.appendChild(wrapper);

    return node;
  }

  eq(other: VariablePrefixWidget) {
    return (
      this.openList === other.openList &&
      this.variableContext.nodeName === other.variableContext.nodeName &&
      this.variableContext.range.from === other.variableContext.range.from &&
      this.variableContext.range.to === other.variableContext.range.to &&
      this.variableContext.varaibleInfo ===
        other.variableContext.varaibleInfo &&
      this.readonly === other.readonly &&
      this.variableContext.isDarkTheme === other.variableContext.isDarkTheme
    );
  }
}
