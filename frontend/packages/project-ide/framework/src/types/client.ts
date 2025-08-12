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
     * Main editing area rendering content
     */
    widgetRegistries: WidgetRegistry[];
    /**
     * default render page
     */
    widgetDefaultRender: () => ReactElement<any, any>;
    /**
     * The widget reports an error. If the widget hangs up, it will render the component and send event tracking.
     */
    widgetFallbackRender?: (props: {
      widget: ReactWidget;
    }) => ReactElement<any, any>;
    /**
     * unified title rendering
     */
    widgetTitleRender: WidgetTitleRender;
    /**
     * Primary sidebar rendering
     */
    primarySideBar: () => ReactElement<any, any>;
    /**
     * Auxiliary Sidebar Rendering
     */
    secondarySidebar?: () => ReactElement<any, any>;
    /**
     * Main sidebar bottom partition configuration rendering
     */
    configuration?: () => ReactElement<any, any>;
    /**
     * Front toolbar rendering
     */
    preToolbar?: () => ReactElement<any, any>;
    /**
     * Rear toolbar rendering
     */
    toolbar?: (widget: ProjectIDEWidget) => ReactElement<any, any>;
    /**
     * Top navigation bar
     */
    topBar: () => ReactElement<any, any>;
    /**
     * uibuilder
     */
    uiBuilder: () => ReactElement<any, any> | null;
  };
}
