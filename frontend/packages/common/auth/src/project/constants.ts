// TODO: 替换成Project接口导出的idl
export enum ProjectRoleType {
  Owner = 'owner',
  Editor = 'editor',
}

export enum EProjectPermission {
  /**
   * 访问/查看project
   */
  View,
  /**
   * 编辑project基础信息
   */
  EDIT_INFO,
  /**
   * 删除project
   */
  DELETE,
  /**
   * 发布project
   */
  PUBLISH,
  /**
   * 创建project内资源
   */
  CREATE_RESOURCE,
  /**
   * 在project内复制资源
   */
  COPY_RESOURCE,
  /**
   * 复制project/创建副本
   */
  COPY,
  /**
   * 试运行plugin
   */
  TEST_RUN_PLUGIN,
  /**
   * 试运行workflow
   */
  TEST_RUN_WORKFLOW,
  /**
   * 添加project协作者
   */
  ADD_COLLABORATOR,
  /**
   * 删除project协作者
   */
  DELETE_COLLABORATOR,
  /**
   * 回滚 APP 版本
   */
  ROLLBACK,
}
