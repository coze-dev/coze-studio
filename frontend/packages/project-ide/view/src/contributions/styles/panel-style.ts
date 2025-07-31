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

import { LayoutPanelType } from '../../types';
import { SPLIT_PANEL_CLASSNAME } from '../../constants/view';
import { PANEL_CLASS_NAME_MAP } from '../../constants';

export const getPanelStyle = (getColor: (id: string) => string): string => `
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.TOP_BAR].displayName} {
    min-height: 40px;
    background: ${getColor('flowide.color.base.bg.2')};
    color: ${getColor('flowide.color.base.text.0')};
    border-bottom: 1px solid ${getColor('flowide.color.base.border')};
  }
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.ACTIVITY_BAR].displayName} {
    min-width: 36px;
    color: ${getColor('flowide.color.base.text.0')};
    background: ${getColor('flowide.color.base.bg.2')};
    border-right: 1px solid ${getColor('flowide.color.base.border')};
  }
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.PRIMARY_SIDEBAR].displayName} {
    min-width: 110px !important;
    color: ${getColor('flowide.color.base.text.0')};
    background: ${getColor('flowide.color.base.bg.1')};
    border-right: 1px solid ${getColor('flowide.color.base.border')};
  }
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.MAIN_PANEL].displayName} {
    color: ${getColor('flowide.color.base.text.0')};
    background: ${getColor('flowide.color.base.bg.0')};
  }
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.SECONDARY_SIDEBAR].displayName} {
    min-width: 110px;
  }
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.STATUS_BAR].displayName} {
    min-height: 22px;
    background: ${getColor('flowide.color.base.bg.2')};
    border-top: 1px solid ${getColor('flowide.color.base.border')};
  }
  #${PANEL_CLASS_NAME_MAP[LayoutPanelType.BOTTOM_PANEL].displayName} {
    background: ${getColor('flowide.color.base.bg.0')};
    color: ${getColor('flowide.color.base.text.0')};
    border-top: 1px solid ${getColor('flowide.color.base.border')};
  }

  .${SPLIT_PANEL_CLASSNAME} .lm-SplitPanel-child.expand {
    min-height: 75px;
  }

  .${SPLIT_PANEL_CLASSNAME} .lm-SplitPanel-child.close {
    min-height: 22px;
    max-height: 22px;
  }

  .${SPLIT_PANEL_CLASSNAME}[data-orientation="vertical"] .lm-SplitPanel-handle {
    background: ${getColor('flowide.color.base.border')};
    min-height: 1px;
    z-index: 3;
  }
  .${SPLIT_PANEL_CLASSNAME}[data-orientation="vertical"] .lm-SplitPanel-handle:hover {
    background: ${getColor('flowide.color.base.primary.hover')};
    min-height: 4px;
  }
  .${SPLIT_PANEL_CLASSNAME}[data-orientation="vertical"] .lm-SplitPanel-handle:active {
    background: ${getColor('flowide.color.base.primary')};
    min-height: 4px;
  }

  .${SPLIT_PANEL_CLASSNAME}[data-orientation="horizontal"] .lm-SplitPanel-handle {
    background: ${getColor('flowide.color.base.border')};
    min-width: 1px;
  }
  .${SPLIT_PANEL_CLASSNAME}[data-orientation="horizontal"] .lm-SplitPanel-handle:hover {
    background: ${getColor('flowide.color.base.primary.hover')};
    min-width: 4px;
  }
  .${SPLIT_PANEL_CLASSNAME}[data-orientation="horizontal"] .lm-SplitPanel-handle:active {
    background: ${getColor('flowide.color.base.primary')};
    min-width: 4px;
  }
  `;
