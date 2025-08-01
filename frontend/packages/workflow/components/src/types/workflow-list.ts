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
 * Open the pop-up scene, mainly for logging
 *
 * WorkflowAddNode scenes have special handling
 */
export enum WorkflowModalFrom {
  /** Process details Add subprocess */
  WorkflowAddNode = 'workflow_addNode',
  /** Open in bot skills */
  BotSkills = 'bot_skills',
  /** Open ide in Douyin doppelganger scene */
  BotSkillsDouyin = 'bot_skills_douyin_ide',
  /** Open in bot multi-agent skills */
  BotMultiSkills = 'bot_multi_skills',
  /** Open in bot triggers  */
  BotTrigger = 'bot_trigger',
  /** Bot shortcut open */
  BotShortcut = 'bot_shortcut',
  /** process list under space */
  SpaceWorkflowList = 'space_workflow_list',
  /** From workflow as agent */
  WorkflowAgent = 'workflow_agent',
  /** Social scene workflow list */
  SocialSceneHost = 'social_scene_host',
  /** project import repository file */
  ProjectImportLibrary = 'project_import_library',
  /** Add subflow to workflow canvas in project */
  ProjectWorkflowAddNode = 'project_workflow_addNode',
  /**
   * List of workflow resources in the project Add workflow resources
   */
  ProjectAddWorkflowResource = 'project_add_workflow_resource',
}
