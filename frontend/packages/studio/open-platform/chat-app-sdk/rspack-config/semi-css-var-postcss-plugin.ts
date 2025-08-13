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

/**
 * PostCSS 插件：为 Semi 组件类名和 CSS 变量添加前缀
 * 解决 coze-design 里 hardcode 的 .semi-xxx 类名与 prefixCls 不匹配导致样式失效问题
 * 兼容多类名、嵌套、伪类、组合选择器等复杂情况
 *
 * 注意：本插件应在 coze-design 的样式被引入后生效，确保所有 .semi-xxx 都能被正确加前缀
 *
 * 已添加调试代码，可通过环境变量 DEBUG_SEMI_CSS_VAR_PLUGIN 控制输出
 */

import type { PluginCreator } from 'postcss';

export const PREFIX_CLASS = 'coze-chat-sdk-semi';
const CSS_VAR_PREFIX = `${PREFIX_CLASS}-`;
const SEMI_CLASS_PREFIX = 'semi-';
const CUSTOM_CLASS_PREFIX = `${PREFIX_CLASS}-`;

// 处理选择器，将 .semi-xxx 替换为 .coze-chat-sdk-semi-xxx
function processSelector(selector: string): string {
  // 只处理 .semi-xxx（不管前面有无其它类名、伪类、组合等）
  // 例如：.semi-button、.semi-button-primary:hover、.foo .semi-button.bar
  // 注意：不要重复加前缀
  // 兼容 :is(.semi-button), :not(.semi-button), .semi-button:hover, .semi-button.foo
  // 兼容多个选择器用逗号分隔的情况
  const replaced = selector.replace(
    /\.semi-([a-zA-Z0-9_-]+)/g,
    (match, className) => {
      // 已经有前缀的不处理
      if (match.includes(`.${CUSTOM_CLASS_PREFIX}`)) {
        return match;
      }
      return `.${CUSTOM_CLASS_PREFIX}${className}`;
    },
  );
  return replaced;
}

const semiCssVarPrefixPlugin: PluginCreator<void> = () => ({
  postcssPlugin: 'semi-css-var-prefix',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Rule(rule) {
    // 只要选择器里有 .semi-，就处理
    if (rule.selector && rule.selector.includes(`.${SEMI_CLASS_PREFIX}`)) {
      rule.selector = processSelector(rule.selector);
    }
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Declaration(decl) {
    // 处理 CSS 变量定义
    if (decl.prop && decl.prop.startsWith('--semi-')) {
      decl.prop = decl.prop.replace(/^--semi-/, `--${CSS_VAR_PREFIX}`);
    }

    // 处理 CSS 变量引用
    if (decl.value && decl.value.includes('var(--semi-')) {
      decl.value = decl.value.replace(
        /var\(--semi-([a-zA-Z0-9_-]+)\)/g,
        `var(--${CSS_VAR_PREFIX}$1)`,
      );
    }

    // 处理 rgba(var(--semi-xxx), ...)
    if (decl.value && decl.value.includes('rgba(var(--semi-')) {
      decl.value = decl.value.replace(
        /rgba\(var\(--semi-([a-zA-Z0-9_-]+)\)/g,
        `rgba(var(--${CSS_VAR_PREFIX}$1)`,
      );
    }
  },
});

semiCssVarPrefixPlugin.postcss = true;

export default semiCssVarPrefixPlugin;
