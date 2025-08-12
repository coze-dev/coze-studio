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

/**
 * Spatially dependent permission spot enumeration
 */
export enum ESpacePermisson {
  /**
   * update space
   */
  UpdateSpace,
  /**
   * delete space
   */
  DeleteSpace,
  /**
   * Add member
   */
  AddBotSpaceMember,
  /**
   * Remove space member
   */
  RemoveSpaceMember,
  /**
   * exit space
   */
  ExitSpace,
  /**
   * Transfer owner permissions
   */
  TransferSpace,
  /**
   * update member
   */
  UpdateSpaceMember,
  /**
   * Manage API-KEY
   */
  API,
}

/**
 * Spatial Role Enumeration
 */
export { SpaceRoleType } from '@coze-arch/idl/developer_api';
