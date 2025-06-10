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
            // The community version does not currently support conversation management in project, for future expansion
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
      // 无法查看跳转到兜底报错页
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
