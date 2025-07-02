import React, { useLayoutEffect, useMemo, useEffect } from 'react';

import { reportTti } from '@coze-arch/report-tti/custom-perf-metric';
import { FlowRendererRegistry } from '@flowgram-adapter/free-layout-editor';
import { LoggerEvent, LoggerService, useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

import styles from './index.module.less';

export const WorkflowLoader: React.FC = () => {
  const doc = useService<WorkflowDocument>(WorkflowDocument);
  const renderRegistry = useService<FlowRendererRegistry>(FlowRendererRegistry);
  const loggerService = useService<LoggerService>(LoggerService);
  useMemo(() => renderRegistry.init(), [renderRegistry]);
  useLayoutEffect(() => {
    // 加载数据
    doc.load();
    // 销毁数据
    return () => doc.dispose();
  }, [doc]);

  useEffect(() => {
    const disposable = loggerService.onLogger(({ event }) => {
      if (event === LoggerEvent.CANVAS_TTI) {
        // 上报到 coze
        reportTti();
      }
    });

    return () => {
      disposable?.dispose();
    };
  }, []);

  return <div className={styles.playgroundLoad} />;
};
