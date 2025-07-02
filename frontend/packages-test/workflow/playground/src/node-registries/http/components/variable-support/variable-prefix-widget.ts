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

  // 插入 editor 中的变量块 dom
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
