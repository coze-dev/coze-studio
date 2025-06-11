import React, { useCallback, useMemo } from 'react';

import { type interfaces } from 'inversify';
import { FlowRendererContainerModule } from '@flowgram-adapter/free-layout-editor';
import { createNodeCorePlugin } from '@flowgram-adapter/free-layout-editor';
import { createFreeStackPlugin } from '@flowgram-adapter/free-layout-editor';
import { createFreeAutoLayoutPlugin } from '@flowgram-adapter/free-layout-editor';
import { FlowDocumentContainerModule } from '@flowgram-adapter/free-layout-editor';
import {
  PlaygroundReactProvider,
  type Plugin,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocumentContainerModule } from '@flowgram-adapter/free-layout-editor';

import { WorkflowRenderContainerModule } from './workflow-render-container-module';
import { WorkflowLoader } from './workflow-loader';

export interface WorkflowRenderProviderProps {
  children: React.ReactElement;
  containerModules?: interfaces.ContainerModule[];
  preset?: () => Plugin[];
  parentContainer?: interfaces.Container;
}

/**
 * 画布引擎渲染
 */
export const WorkflowRenderProvider = (props: WorkflowRenderProviderProps) => {
  const modules = useMemo(
    () => [
      FlowDocumentContainerModule, // 默认文档
      FlowRendererContainerModule, // 默认渲染
      // FlowActivitiesContainerModule, // 这是固定画布的 module，目前不需要依赖
      WorkflowDocumentContainerModule, // 扩展文档
      WorkflowRenderContainerModule, // 扩展渲染
      ...(props.containerModules || []),
    ],
    [],
  );

  const preset = useCallback(
    () => [
      createFreeAutoLayoutPlugin({}),
      createFreeStackPlugin({}), // 渲染层级管理
      createNodeCorePlugin({}),
      ...(props.preset?.() || []),
    ],
    [],
  );

  return (
    <PlaygroundReactProvider
      containerModules={modules}
      plugins={preset}
      parentContainer={props.parentContainer}
    >
      <WorkflowLoader />
      {props.children}
    </PlaygroundReactProvider>
  );
};
