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
 
/* eslint-disable @typescript-eslint/naming-convention */
export enum FeatureEvents {
  /**
   * space event
   */
  createSpace = 'create_space', // 创建空间
  updateSpace = 'update_space', // 更新空间
  transferSpace = 'transfer_space',
  spaceMemberSearch = 'space_member_search',
  spaceMemberDetail = 'space_member_detail', // 获取空间成员
  spaceMemberAdd = 'space_member_add', // 空间添加成员
  deleteSpace = 'delete_space',
  leaveSpace = 'leave_space',
  spaceParseMemberCsv = 'space_parse_member_csv',
  spaceImportMembers = 'space_import_members',
  /**
   * user profile
   */
  editUserProfile = 'edit_user_profile',
  updateUserProfileCheck = 'update_user_profile_check',
  getUserAuthList = 'user_auth_list',
  /**
   * http 图片转化测试用
   */
  convertHttpImg = 'convert_http_img',

  // content-box
  loadContentBox = 'load-content-box',
  /**
   * publish-event
   */
  publishPlatform = 'publish_platform',
  unbindPublishPlatform = 'unbind_publish_platform',
  generateChangeLog = 'generate_changelog',
  recordChangeLog = 'record_changelog',
  /**
   * passport
   */
  passportService = 'passport_service', // passport相关的全部请求
  passportHttpRequestFail = 'passport_http_request_fail', // passport 请求失败（非业务失败）
  InviteLinkCopySuccess = 'invite_link_copy_success',
  JoinSpaceSuccess = 'join_space_success',
  unhandledrejection = 'unhandledrejection',
  oauthLogin = 'oauth_login',
  /**
   * 消息链路事件 
   */
  botDebugMessageSubmit = 'bot_debug_message_submit', // Bot执行调试（发送消息）
  receiveMessage = 'receive_message',
  emptyReceiveMessage = 'empty_receive_message',
  messageReceiveSuggests = 'message_receive_suggests',
  receiveTotalMessages = 'receive_total_messages',
  getCategoryList = 'get_category_list', // explore获取分类列表
  /**
   * coze token
   */
  getTokenSkus = 'get_token_Skus',
  createTokenChargeOrder = 'create_token_charge_order',
  /**
   * coze open api
   */
  openGetSpace = 'open_get_space',
  openArcositeContent = 'open_arcosite_content',
  openGetPatList = 'open_get_pat_list',
  openPatAction = 'open_pat_action',
  /**
   * 协作模式长链接
   */
  editWebSocketInit = 'edit_web_socket_init',
  pluginIdeInit = 'plugin_ide_init', // plugin ide初始化监控
  pluginIdeInitTrace = 'plugin_ide_init_trace', // plugin ide初始化性能监控
  pluginIdeDispose = 'plugin_ide_dispose', // plugin ide dispose

  // 路由重定向
  pathFallbackRedirect = 'path_fallback_redirect',
}
