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

  // 插入 editor 中的变量块 dom
  toDOM() {
    const node = document.createElement('span');
    node.classList.add(s.content);
    // 全局变量光标样式
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
