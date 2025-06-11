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

  // 插入 editor 中的变量块 dom
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
