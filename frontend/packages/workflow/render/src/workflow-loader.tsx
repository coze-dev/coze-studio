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

import React, { useLayoutEffect, useMemo, useEffect } from 'react';

import { FlowRendererRegistry } from '@flowgram-adapter/free-layout-editor';
import {
  LoggerEvent,
  LoggerService,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { reportTti } from '@coze-arch/report-tti/custom-perf-metric';

import styles from './index.module.less';

export const WorkflowLoader: React.FC = () => {
  const doc = useService<WorkflowDocument>(WorkflowDocument);
  const renderRegistry = useService<FlowRendererRegistry>(FlowRendererRegistry);
  const loggerService = useService<LoggerService>(LoggerService);
  useMemo(() => renderRegistry.init(), [renderRegistry]);
  useLayoutEffect(() => {
    // load data
    doc.load();
    // Destroy data
    return () => doc.dispose();
  }, [doc]);

  useEffect(() => {
    const disposable = loggerService.onLogger(({ event }) => {
      if (event === LoggerEvent.CANVAS_TTI) {
        // Report to coze
        reportTti();
      }
    });

    return () => {
      disposable?.dispose();
    };
  }, []);

  return <div className={styles.playgroundLoad} />;
};
