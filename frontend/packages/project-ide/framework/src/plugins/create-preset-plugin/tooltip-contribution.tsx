import React from 'react';

import { inject, injectable, postConstruct } from 'inversify';
import { Tooltip } from '@coze-arch/coze-design';
import {
  type URI,
  type LabelHandler,
  HoverService,
} from '@coze-project-ide/client';

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
