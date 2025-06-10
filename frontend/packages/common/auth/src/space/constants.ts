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
