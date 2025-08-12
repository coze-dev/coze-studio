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

export const getFlowMenuStyle = (getColor: (id: string) => string): string => `
  .flow-Menu {
    z-index: 10000;
    position: absolute;
    top: 0;
    left: 0;
    padding: 4px;
    white-space: nowrap;
    overflow-x: hidden;
    overflow-y: auto;
    outline: none;
    font: 12px Helvetica,Arial,sans-serif;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background: ${getColor('flowide.color.base.bg.0')};
    color: ${getColor('flowide.color.base.text.0')};
    border: 1px solid ${getColor('flowide.color.menu.border')};
    box-shadow: 0 1px 6px ${getColor('flowide.color.menu.box.shadow')};
    border-radius: 6px;
  }

  .flow-Menu-content {
    margin: 0;
    padding: 0;
    display: flex;
    outline: none;
    flex-direction: column;
    list-style-type: none;
  }

  .flow-Menu-item {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    border-radius: 4px;
    align-items: center;
    outline: none;
    cursor: pointer;
  }

  .flow-Menu-item.flow-mod-active {
    background: ${getColor('flowide.color.base.fill.0')};
  }

  .flow-Menu-item.flow-mod-disabled {
    opacity: 0.35;
  }

  .flow-Menu-item.flow-mod-hidden,
  .flow-Menu-item.flow-mod-collapsed {
    display: none !important;
  }

  .flow-Menu-itemIcon,
  .flow-Menu-itemSubmenuIcon {
    text-align: center;
  }

  .flow-Menu-itemLabel {
    text-align: left;
    padding: 4px 35px 4px 2px;
  }

  .flow-Menu-itemShortcut {
    text-align: right;
  }
  .flow-Menu-itemIcon::before,
  .flow-Menu-itemSubmenuIcon::before {
    font-family: codicon;
  }

  .flow-Menu-item > .flow-Menu-itemSubmenuIcon::before {
    content: '\\eab6';
    line-height: 20px;
  }
`;
