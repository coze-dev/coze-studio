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
  createSpace = 'create_space', // Create space
  updateSpace = 'update_space', // update space
  transferSpace = 'transfer_space',
  spaceMemberSearch = 'space_member_search',
  spaceMemberDetail = 'space_member_detail', // Get space member
  spaceMemberAdd = 'space_member_add', // Space Add Member
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
   * HTTP image conversion test
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
  passportService = 'passport_service', // All passport related requests
  passportHttpRequestFail = 'passport_http_request_fail', // Passport request failed (non-business failure)
  InviteLinkCopySuccess = 'invite_link_copy_success',
  JoinSpaceSuccess = 'join_space_success',
  unhandledrejection = 'unhandledrejection',
  oauthLogin = 'oauth_login',
  /**
   * Message Link Event
   */
  botDebugMessageSubmit = 'bot_debug_message_submit', // Bot to perform debugging (send messages)
  receiveMessage = 'receive_message',
  emptyReceiveMessage = 'empty_receive_message',
  messageReceiveSuggests = 'message_receive_suggests',
  receiveTotalMessages = 'receive_total_messages',
  getCategoryList = 'get_category_list', // Explore Get Category List
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
   * Collaboration Mode Long Link
   */
  editWebSocketInit = 'edit_web_socket_init',
  pluginIdeInit = 'plugin_ide_init', // Plugin ide initialization monitoring
  pluginIdeInitTrace = 'plugin_ide_init_trace', // Plugin ide initialization performance monitoring
  pluginIdeDispose = 'plugin_ide_dispose', // plugin ide dispose

  // route redirection
  pathFallbackRedirect = 'path_fallback_redirect',
}
