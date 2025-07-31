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

// TODO: replace with idl exported by Project interface
export enum ProjectRoleType {
  Owner = 'owner',
  Editor = 'editor',
}

export enum EProjectPermission {
  /**
   * Visit/view projects
   */
  View,
  /**
   * Edit project basic information
   */
  EDIT_INFO,
  /**
   * Delete project
   */
  DELETE,
  /**
   * Publish project
   */
  PUBLISH,
  /**
   * Create project resources
   */
  CREATE_RESOURCE,
  /**
   * Copy resources within the project
   */
  COPY_RESOURCE,
  /**
   * Copy project/create copy
   */
  COPY,
  /**
   * Practice running plugins
   */
  TEST_RUN_PLUGIN,
  /**
   * Practice running workflow
   */
  TEST_RUN_WORKFLOW,
  /**
   * Add project collaborators
   */
  ADD_COLLABORATOR,
  /**
   * Delete project collaborator
   */
  DELETE_COLLABORATOR,
  /**
   * Roll back the APP version
   */
  ROLLBACK,
}
