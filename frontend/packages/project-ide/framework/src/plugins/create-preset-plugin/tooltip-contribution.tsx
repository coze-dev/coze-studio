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
 
import React from 'react';

import { inject, injectable, postConstruct } from 'inversify';
import {
  type URI,
  type LabelHandler,
  HoverService,
} from '@coze-project-ide/client';
import { Tooltip } from '@coze-arch/coze-design';

// 自定义 IDE HoverService 样式
@injectable()
class TooltipContribution implements LabelHandler {
  @inject(HoverService) hoverService: HoverService;

  visible = false;

  @postConstruct()
  init() {
    this.hoverService.enableCustomHoverHost();
  }

  canHandle(uri: URI): number {
    return 500;
  }

  renderer(uri: URI, opt?: any): React.ReactNode {
    // 下边的 opacity、width 设置原因：
    // semi 源码位置：https://github.com/DouyinFE/semi-design/blob/main/packages/semi-foundation/tooltip/foundation.ts#L342
    // semi 有 trigger 元素判断，本次自定义 semi 组件没有 focus 内部元素。
    return opt?.content ? (
      <Tooltip
        key={opt.content}
        content={opt.content}
        position={opt.position}
        // 覆盖设置重置 foundation opacity，避免 tooltip 跳动
        style={{ opacity: 1 }}
        trigger="custom"
        getPopupContainer={() => document.body}
        visible={true}
      >
        {/* 宽度 0 避免被全局样式影响导致 Tooltip 定位错误 */}
        <div style={{ width: 0 }}></div>
      </Tooltip>
    ) : null;
  }

  onDispose() {
    return;
  }
}

export { TooltipContribution };
