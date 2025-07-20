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
 
import {
  type ResourceActionAuth,
  type Workflow,
} from '@coze-workflow/base/api';

interface Auth {
  authInfo: ResourceActionAuth;
}

export type WorkflowInfo = Workflow & Auth;

/**
 * 打开弹窗场景, 主要用于 log
 *
 * WorkflowAddNode 场景有特殊处理
 */
export enum WorkflowModalFrom {
  /** 流程详情添加子流程 */
  WorkflowAddNode = 'workflow_addNode',
  /** 在 bot skills 打开 */
  BotSkills = 'bot_skills',
  /** 在抖音分身场景的 ide 打开 */
  BotSkillsDouyin = 'bot_skills_douyin_ide',
  /** 在 bot 多 agent skills 打开 */
  BotMultiSkills = 'bot_multi_skills',
  /** 在 bot triggers 打开  */
  BotTrigger = 'bot_trigger',
  /** bot 快捷方式打开 */
  BotShortcut = 'bot_shortcut',
  /** 空间下流程列表 */
  SpaceWorkflowList = 'space_workflow_list',
  /** 来自 workflow as agent */
  WorkflowAgent = 'workflow_agent',
  /** 社会场景 workflow 列表 */
  SocialSceneHost = 'social_scene_host',
  /** 项目引入资源库文件 */
  ProjectImportLibrary = 'project_import_library',
  /** 项目内 workflow 画布添加子流程 */
  ProjectWorkflowAddNode = 'project_workflow_addNode',
  /**
   * 项目内 workflow 资源列表添加 workflow 资源
   */
  ProjectAddWorkflowResource = 'project_add_workflow_resource',
}
