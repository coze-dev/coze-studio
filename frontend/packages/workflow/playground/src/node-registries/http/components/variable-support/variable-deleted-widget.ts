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

import { I18n } from '@coze-arch/i18n';
import { WidgetType } from '@codemirror/view';

import { getIconSvgString } from './utils';
import type { RangeType } from './types';

import s from './index.module.less';

export class VariableDeleteWidget extends WidgetType {
  constructor(
    protected range: RangeType,
    protected openList: (range: RangeType) => void,
  ) {
    super();
  }

  // Insert variable block dom in editor
  toDOM() {
    const wrapper = document.createElement('span');
    wrapper.classList.add(s['deleted-variable']);
    wrapper.onclick = () => {
      this.openList(this.range);
    };

    const img = document.createElement('div');
    img.classList.add(s.svg);
    img.innerHTML = getIconSvgString().delete;

    const text = document.createElement('span');
    text.classList.add(s['deleted-text']);
    text.innerText = I18n.t('node_http_var_infer_delete', {}, '变量失效');

    wrapper.appendChild(img);
    wrapper.appendChild(text);

    return wrapper;
  }

  eq(other: VariableDeleteWidget) {
    return (
      this.openList === other.openList &&
      this.range.from === other.range.from &&
      this.range.to === other.range.to
    );
  }
}
