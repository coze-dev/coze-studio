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

import type React from 'react';
import { useEffect, useState, startTransition, useRef } from 'react';

import { type FloatLayoutPanel } from '../../services/workflow-float-layout-service';

interface FloatPanelProps {
  panel: FloatLayoutPanel;
}

export const FloatPanel: React.FC<FloatPanelProps> = ({ panel }) => {
  const nodeRef = useRef(panel.render());
  const [, setVersion] = useState(0);

  useEffect(() => {
    const dispose = panel.onUpdate(next => {
      /**
       * Click on the blank area to close the scene of SideSheet.
       *
       * Question:
       * - Closing SideSheet directly will cause the Blur event of the form in the drawer to not be triggered, and the UI will be destroyed first
       *
       * Solution ideas:
       * - UI updates need to be prioritized lower than form blur related data updates in the drawer
       *
       * Specific plan:
       * - Use start Transition to lower the priority of UI destruction this time, so that Blur-related data updates can be executed before the UI destruction of the drawer
       */
      startTransition(() => {
        nodeRef.current = next;
        setVersion(v => v + 1);
      });
    });
    return () => dispose.dispose();
  }, [panel]);

  return <>{nodeRef.current}</>;
};
