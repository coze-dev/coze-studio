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
 * Layout floating layer covering the entire canvas, carrying some linked suspension components
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
    // Only trigger once
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
      // Process template closing animation for 200 ms, close bottom panel after animation
      setTimeout(() => {
        floatLayoutService.close('bottom');
      }, 300);
    }
  }, [isInitWorkflow, workflowTemplateList, floatLayoutService, templateState]);

  return (
    <div className={styles['float-layout']} ref={ref}>
      <div className={styles['left-panel']}>
        {/* main panel */}
        <div className={styles['left-main-panel']}>{children}</div>
        {/* Bottom panel, the priority is higher than the main area, the default height is 0, once there is a height, it will squeeze the main panel */}
        <div className={styles['left-bottom-panel']}>
          <FloatPanel panel={floatLayoutService.bottom} />
        </div>
      </div>
      {/* The right area has the highest priority. The default width is 0. Once there is a width, the left side will be squeezed. */}
      <div className={styles['right-panel']}>
        <FloatPanel panel={floatLayoutService.right} />
      </div>
    </div>
  );
};
