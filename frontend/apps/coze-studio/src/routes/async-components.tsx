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

import { lazy } from 'react';

// 登录页面
export const LoginPage = lazy(() =>
  import('@coze-foundation/account-ui-adapter').then(res => ({
    default: res.LoginPage,
  })),
);

// 文档页面
export const Redirect = lazy(() => import('../pages/redirect'));

// 工作空间侧边栏组件
export const spaceSubMenu = lazy(() =>
  import('@coze-foundation/space-ui-adapter').then(exps => ({
    default: exps.WorkspaceSubMenu,
  })),
);

// 工作空间布局组件
export const SpaceLayout = lazy(() =>
  import('@coze-foundation/space-ui-adapter').then(exps => ({
    default: exps.SpaceLayout,
  })),
);

// 某个具体的工作空间布局组件
export const SpaceIdLayout = lazy(() =>
  import('@coze-foundation/space-ui-base').then(exps => ({
    default: exps.SpaceIdLayout,
  })),
);

// 项目开发页面
export const Develop = lazy(() => import('../pages/develop'));

// 资源库页面
export const Library = lazy(() => import('../pages/library'));

// Agent IDE布局组件
export const AgentIDELayout = lazy(
  () => import('@coze-agent-ide/layout-adapter'),
);

// Agent IDE页面
export const AgentIDE = lazy(() =>
  import('@coze-agent-ide/entry-adapter').then(res => ({
    default: res.BotEditor,
  })),
);

// Agent IDE发布页面
export const AgentPublishPage = lazy(() =>
  import('@coze-agent-ide/agent-publish').then(exps => ({
    default: exps.AgentPublishPage,
  })),
);

// Project IDE页面
export const ProjectIDE = lazy(() =>
  import('@coze-project-ide/main').then(exps => ({
    default: exps.IDELayout,
  })),
);

// Project IDE发布页面
export const ProjectIDEPublish = lazy(() =>
  import('@coze-studio/project-publish').then(exps => ({
    default: exps.ProjectPublish,
  })),
);

// 知识库预览页面
export const KnowledgePreview = lazy(() =>
  import('@coze-studio/workspace-base/knowledge-preview').then(exps => ({
    default: exps.KnowledgePreviewPage,
  })),
);

// 知识库上传页面
export const KnowledgeUpload = lazy(() =>
  import('@coze-studio/workspace-base/knowledge-upload').then(exps => ({
    default: exps.KnowledgeUploadPage,
  })),
);

// 数据库资源页面
export const DatabaseDetail = lazy(() =>
  import('@coze-studio/workspace-base').then(exps => ({
    default: exps.DatabaseDetailPage,
  })),
);

// 工作流页面
export const WorkflowPage = lazy(() =>
  import('@coze-workflow/playground-adapter').then(res => ({
    default: res.WorkflowPage,
  })),
);

// 插件资源页面布局组件
export const PluginLayout = lazy(() => import('../pages/plugin/layout'));

// 插件资源页面
export const PluginPage = lazy(() => import('../pages/plugin/page'));

// 插件工具页面
export const PluginToolPage = lazy(() => import('../pages/plugin/tool/page'));

// 探索体验页面二级导航组件
export const exploreSubMenu = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.ExploreSubMenu,
  })),
);

// 模版页面
export const ExploreTemplatePage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.TemplatePage,
  })),
);

// 插件商店页面
export const ExplorePluginPage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.PluginPage,
  })),
);
