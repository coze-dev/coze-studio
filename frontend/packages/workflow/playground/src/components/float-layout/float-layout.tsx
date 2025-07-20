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
 * 覆盖在整个画布上的布局浮层，承载一些有联动关系的悬浮组件
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';

import { useSize } from 'ahooks';

import { type Render } from '@/services/workflow-float-layout-service';
import { useTemplateService } from '@/hooks/use-template-service';
import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import { useGlobalState } from '@/hooks';

import { useWorkflowTemplateList } from '../template-panel/use-workflow-template-list';
import { FloatPanel } from './float-panel';

import styles from './float-layout.module.less';

export interface FloatLayoutProps {
  components: Record<string, Render>;
}

export const FloatLayout: React.FC<
  React.PropsWithChildren<FloatLayoutProps>
> = ({ components, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { isInitWorkflow, spaceId, flowMode } = useGlobalState();

  const floatLayoutService = useFloatLayoutService();
  const templateState = useTemplateService();

  const size = useSize(ref);

  useLayoutEffect(() => {
    // 只触发一次
    floatLayoutService.register(components);
  }, []);

  useEffect(() => {
    if (size) {
      floatLayoutService.setLayoutSize(size);
    }
  }, [size, floatLayoutService]);

  const { workflowTemplateList } = useWorkflowTemplateList({
    spaceId,
    flowMode,
    isInitWorkflow,
  });

  useEffect(() => {
    if (isInitWorkflow) {
      if (!workflowTemplateList?.length) {
        return;
      }
      templateState.setTemplateList(workflowTemplateList);
      floatLayoutService.open('templatePanel', 'bottom');
      templateState.openTemplate();
    } else {
      templateState.closeTemplate();
      // 流程模版关闭动画为 200 ms , 待动画结束后关闭 bottom 面板
      setTimeout(() => {
        floatLayoutService.close('bottom');
      }, 300);
    }
  }, [isInitWorkflow, workflowTemplateList, floatLayoutService, templateState]);

  return (
    <div className={styles['float-layout']} ref={ref}>
      <div className={styles['left-panel']}>
        {/* 主面板 */}
        <div className={styles['left-main-panel']}>{children}</div>
        {/* 底部面板，优先级比主区域高，默认高度为 0，一旦有高度会挤压主面板 */}
        <div className={styles['left-bottom-panel']}>
          <FloatPanel panel={floatLayoutService.bottom} />
        </div>
      </div>
      {/* 右侧区域，优先级最高，默认宽度为 0，一旦有宽度就会挤压左侧 */}
      <div className={styles['right-panel']}>
        <FloatPanel panel={floatLayoutService.right} />
      </div>
    </div>
  );
};
