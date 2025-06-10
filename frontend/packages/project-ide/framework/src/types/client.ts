import { type ReactElement } from 'react';

import {
  type CommandRegistry,
  type ReactWidget,
} from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';

import { type WidgetUIState } from './widget';
import { type WidgetRegistry } from './registry';

export const ProjectIDEClientProps = Symbol('ProjectIDEClientProps');

export interface TitlePropsType {
  commandRegistry: CommandRegistry;
  registry: WidgetRegistry;
  title: string;
  widget?: ReactWidget;
  uiState: WidgetUIState;
}

export type WidgetTitleRender = (
  props: TitlePropsType,
) => ReactElement<any, any>;

export interface ProjectIDEClientProps {
  view: {
    /**
     * 主编辑区域渲染内容
     */
    widgetRegistries: WidgetRegistry[];
    /**
     * 默认渲染页
     */
    widgetDefaultRender: () => ReactElement<any, any>;
    /**
     * widget 兜底报错，如果 widget 挂掉会渲染该组件，发送埋点
     */
    widgetFallbackRender?: (props: {
      widget: ReactWidget;
    }) => ReactElement<any, any>;
    /**
     * 统一标题渲染
     */
    widgetTitleRender: WidgetTitleRender;
    /**
     * 主侧边栏渲染
     */
    primarySideBar: () => ReactElement<any, any>;
    /**
     * 辅助侧边栏渲染
     */
    secondarySidebar?: () => ReactElement<any, any>;
    /**
     * 主侧边栏底部分区 configuration 配置渲染
     */
    configuration?: () => ReactElement<any, any>;
    /**
     * 前置工具栏渲染
     */
    preToolbar?: () => ReactElement<any, any>;
    /**
     * 后置工具栏渲染
     */
    toolbar?: (widget: ProjectIDEWidget) => ReactElement<any, any>;
    /**
     * 顶部导航栏
     */
    topBar: () => ReactElement<any, any>;
    /**
     * uibuilder
     */
    uiBuilder: () => ReactElement<any, any> | null;
  };
}
