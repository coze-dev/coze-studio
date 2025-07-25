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
 * 空间相关的权限点枚举
 */
export enum ESpacePermisson {
  /**
   * 更新空间
   */
  UpdateSpace,
  /**
   * 删除空间
   */
  DeleteSpace,
  /**
   * 添加成员
   */
  AddBotSpaceMember,
  /**
   * 移除空间成员
   */
  RemoveSpaceMember,
  /**
   * 退出空间
   */
  ExitSpace,
  /**
   * 转移owner权限
   */
  TransferSpace,
  /**
   * 更新成员
   */
  UpdateSpaceMember,
  /**
   * 管理API-KEY
   */
  API,
}

/**
 * 空间角色枚举
 */
export { SpaceRoleType } from '@coze-arch/idl/developer_api';
