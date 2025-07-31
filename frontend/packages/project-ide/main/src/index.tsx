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

import 'reflect-metadata';
import { useNavigate } from 'react-router-dom';
import React, { useMemo, memo } from 'react';

import { SecondarySidebar } from '@coze-project-ide/ui-adapter';
import {
  ProjectIDEClient,
  IDEGlobalProvider,
  type ProjectIDEWidget,
} from '@coze-project-ide/framework';
import {
  WorkflowWidgetRegistry,
  ConversationRegistry,
} from '@coze-project-ide/biz-workflow';
import { PluginWidgetRegistry } from '@coze-project-ide/biz-plugin-registry-adapter';
import {
  KnowledgeWidgetRegistry,
  VariablesWidgetRegistry,
  DatabaseWidgetRegistry,
} from '@coze-project-ide/biz-data/registry';
import { createResourceFolderPlugin } from '@coze-project-ide/biz-components';
import { useProjectAuth, EProjectPermission } from '@coze-common/auth';

import { createAppPlugin } from './plugins';
import IDELayout from './layout';
import {
  TopBar,
  PrimarySidebar,
  widgetTitleRender,
  WidgetDefaultRenderer,
  SidebarExpand,
  ToolBar,
  GlobalModals,
  ErrorFallback,
  GlobalHandler,
  BrowserTitle,
  GlobalLoading,
  Configuration,
  UIBuilder,
} from './components';

import './styles/recommend.css';
import './index.less';

interface ProjectIDEProps {
  spaceId: string;
  projectId: string;
  version: string;
}

const ProjectIDE: React.FC<ProjectIDEProps> = memo(
  ({ spaceId, projectId, version }) => {
    const navigate = useNavigate();
    const canView = useProjectAuth(EProjectPermission.View, projectId, spaceId);

    const options = useMemo(
      () => ({
        view: {
          widgetRegistries: [
            // will support soon
            ...(IS_OPEN_SOURCE ? [] : [ConversationRegistry]),
            WorkflowWidgetRegistry,
            DatabaseWidgetRegistry,
            KnowledgeWidgetRegistry,
            PluginWidgetRegistry,
            VariablesWidgetRegistry,
          ],
          secondarySidebar: SecondarySidebar,
          topBar: TopBar,
          primarySideBar: PrimarySidebar as () => React.ReactElement<any, any>,
          configuration: Configuration,
          widgetTitleRender,
          widgetDefaultRender: WidgetDefaultRenderer,
          widgetFallbackRender: ({ widget }) => (
            // <div>Widget error: {widget.id}</div>
            <ErrorFallback />
          ),
          preToolbar: () => <SidebarExpand />,
          toolbar: (widget: ProjectIDEWidget) => <ToolBar widget={widget} />,
          uiBuilder: () => (IS_OVERSEA ? null : <UIBuilder />),
        },
      }),
      [],
    );
    const plugins = useMemo(
      () => [
        createAppPlugin({ spaceId, projectId, navigate, version }),
        createResourceFolderPlugin(),
      ],
      [spaceId, projectId, version, navigate],
    );
    if (!canView) {
      // Unable to view Jump to the bottom cover error page
      throw new Error('can not view');
    }

    return (
      <IDEGlobalProvider
        spaceId={spaceId}
        projectId={projectId}
        version={version}
      >
        <ProjectIDEClient presetOptions={options} plugins={plugins}>
          <BrowserTitle />
          <GlobalModals />
          <GlobalHandler spaceId={spaceId} projectId={projectId} />
          <GlobalLoading />
        </ProjectIDEClient>
      </IDEGlobalProvider>
    );
  },
);

export { ProjectIDE, IDELayout };
