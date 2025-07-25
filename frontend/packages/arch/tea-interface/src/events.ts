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
 
/* eslint-disable max-lines */
import { type OperateType } from '@coze-arch/bot-api/workflow_api';
import { type ChannelType } from '@coze-arch/bot-api/ui-builder';
import { type Int64 } from '@coze-arch/bot-api/developer_api';

import {
  type ProductRunFrontParams,
  type ProductClickFrontParams,
  type ProductShowFrontParams,
} from './product';
import {
  type PlaygroundAuthorizeParams,
  type PlaygroundSettingParams,
} from './playground';
import { type TeamInviteParams } from './coze-pro';
// TODO view_bot & view_database 后续考虑下掉

export {
  ProductEventSource,
  ProductEventFilterTag,
  ProductEventEntityType,
  ProductShowFrontParams,
} from './product';

export enum EVENT_NAMES {
  sign_up_front = 'sign_up_front', // 注册登录事件
  page_from = 'page_from', // 上报 referer
  page_view = 'page_view', // 浏览 我的Bot
  view_bot = 'view_bot', // 浏览 我的Bot
  view_database = 'view_database', // 浏览 知识库管理
  click_create_bot_confirm = 'click_create_bot_confirm', // 点击 创建Bot
  click_prompt_edit = 'click_prompt_edit', // 点击 人设与回复逻辑编辑
  click_tool_select = 'click_tool_select', // 点击 调整Bot工具调用
  click_database_select = 'click_database_select', // 点击 调整Bot知识库调用
  click_welcome_message_edit = 'click_welcome_message_edit', // 点击 调整开场白
  click_send_message = 'click_send_message', // 点击 发送调试消息
  delete_rec_plugin = 'delete_rec_plugin', // 删除ai生成的插件
  submit_rec_plugin = 'submit_rec_plugin', // 发布ai生成的插件
  bot_show = 'bot_show', //  bot卡片曝光
  bot_click = 'bot_click', //  点击bot卡片
  click_bot_duplicate = 'click_bot_duplicate', //TODO explore bot点击复制旧埋点先保留 切换至bot_duplicate_click_front后下线
  bot_duplicate_click_front = 'bot_duplicate_click_front', // bot点击复制 统一切换至埋点
  coze_space_sidenavi_ck = 'coze_space_sidenavi_ck', // 菜单栏点击公共埋点
  coze_enterprise_sidenavi_ck = 'coze_enterprise_sidenavi_ck', // 菜单栏点击公共埋点
  // 绑定变量相关埋点
  binding_card_list = 'binding_card_list',
  binding_card_add = 'binding_card_add',
  binding_card_update = 'binding_card_update',
  binding_card_preview = 'binding_card_preview',
  // #region suggestion 相关
  edited_suggestion = 'edited_suggestion',
  // #endregion
  // 卡片编辑器埋点
  builder_editor_view = 'builder_editor_view',
  builder_plugin_info = 'builder_plugin_info',
  builder_plugin_channel = 'builder_plugin_channel',
  builder_plugin_var = 'builder_plugin_var',
  builder_plugin_structure = 'builder_plugin_structure',
  builder_plugin_component = 'builder_plugin_component',
  builder_plugin_canvas = 'builder_plugin_canvas',
  builder_plugin_set = 'builder_plugin_set', // 属性面板
  builder_plugin_preview = 'builder_plugin_preview',
  builder_plugin_publish = 'builder_plugin_publish',
  // ui_builder埋点
  ui_builder_exposure = 'ui_builder_exposure',
  ui_builder_initialization = 'ui_builder_initialization',
  ui_builder_component_usage = 'ui_builder_component_usage',
  ui_builder_setter_usage = 'ui_builder_setter_usage',
  // 模板埋点
  builder_plugin_template = 'builder_plugin_template',
  // Ai埋点
  builder_plugin_copilot_enter_click = 'builder_plugin_copilot_enter_click',
  builder_plugin_copilot_gen_click = 'builder_plugin_copilot_gen_click',
  builder_editor_show = 'builder_editor_show',
  card_webruntime_view = 'card_webruntime_view',
  card_webruntime_render = 'card_webruntime_render',
  card_webruntime_error = 'card_webruntime_error',
  BuilderPluginStructure = 'BuilderPluginStructure',
  BuilderPluginCanvas = 'BuilderPluginCanvas',
  card_builder_show = 'card_builder_show',
  select_scheduled_tasks_timezone = 'select_scheduled_tasks_timezone', // 选择预设定时任务时区
  log_not_supported_timezone = 'log_not_supported_timezone', // 当前环境不支持的时区标识符
  cookie_click = 'cookie_click',
  cookie_show = 'cookie_show',
  // Agent App 埋点
  agent_app_home_view = 'agent_app_home_view',
  agent_app_instance_click = 'agent_app_instance_click',
  agent_app_instance_create = 'agent_app_instance_create',
  agent_app_detail_view = 'agent_app_detail_view',
  agent_app_shortcut_command = 'agent_app_shortcut_command',
  agent_app_send_message = 'agent_app_send_message',
  // 用户视频教程埋点
  tutorial_enter_ck = 'tutorial_enter_ck',
  tutorial_list_pv = 'tutorial_list_pv',
  tutorial_item_ck = 'tutorial_item_ck',
  tutorial_tips_pv = 'tutorial_tips_pv',

  // coze home
  home_page_view = 'home_page_view',
  // 全局侧边栏导航埋点
  tab_click = 'tab_click', // 一级菜单项的点击
  workspace_tab_expose = 'workspace_tab_expose', // Workspace 中各板块的曝光

  // #region 团队空间 key
  create_workspace_click = 'create_workspace_click', // 创建 Workspace 的点击
  create_workspace_result = 'create_workspace_result', // 创建 Workspace 的结果
  /** 禁止子用户创建空间开关点击 */
  enterprise_switch_child_create_space_click = 'enterprise_switch_child_create_space_click',
  /** 禁止添加非子用户进入空间开关点击 */
  enterprise_switch_add_outside_user_click = 'enterprise_switch_add_outside_user_click',
  /** 禁止加入外部空间开关点击 */
  enterprise_switch_join_outside_space_click = 'enterprise_switch_join_outside_space_click',
  /** 空间切换面板展示 */
  space_switch_show = 'space_switch_show',
  /** 空间切换面板点击 */
  space_switch_click = 'space_switch_click',
  /** 成员与设置按钮点击 */
  space_admins_button_click = 'space_admins_button_click',
  /** 成员管理页面展示 */
  space_members_page_show = 'space_members_page_show',
  /** 成员管理页面点击 */
  space_members_page_click = 'space_members_page_click',
  /** 移除成员二次弹窗展示 */
  space_member_remove_pop_show = 'space_member_remove_pop_show',
  /** 移除成员二次弹窗点击 */
  space_member_remove_pop_click = 'space_member_remove_pop_click',
  /** 邀请管理页面展示 */
  space_invitation_page_show = 'space_invitation_page_show',
  /** 邀请管理页面点击 */
  space_invitation_page_click = 'space_invitation_page_click',
  /** 撤销邀请二级弹窗展示 */
  space_invitation_revoke_pop_show = 'space_invitation_revoke_pop_show',
  /** 撤销邀请二级弹窗点击 */
  space_invitation_revoke_pop_click = 'space_invitation_revoke_pop_click',

  /** 团队设置页面展示 */
  space_settings_page_show = 'space_settings_page_show',
  /** 团队设置页面点击 */
  space_settings_page_click = 'space_settings_page_click',
  /** 成员团队设置按钮点击 */
  space_settings_button_click = 'space_settings_button_click',
  /** 分享链接弹窗展示 */
  space_share_link_popup_show = 'space_share_link_popup_show',
  /** 分享链接弹窗点击 */
  space_share_link_popup_click = 'space_share_link_popup_click',
  /** 添加成员弹窗展示 */
  space_add_members_popup_show = 'space_add_members_popup_show',
  /** 添加成员弹窗点击 */
  space_add_members_popup_click = 'space_add_members_popup_click',
  /** 离开团队弹窗展示 */
  space_settings_secondary_pop_show = 'space_settings_secondary_pop_show',
  space_settings_secondary_pop_click = 'space_settings_secondary_pop_click',
  // #endregion

  create_bot_click = 'create_bot_click', // 创建 Bot 的点击
  create_bot_result = 'create_bot_result', // 创建 Bot 的结果
  bot_duplicate_click = 'bot_duplicate_click', // Bot 复制的点击
  bot_duplicate_result = 'bot_duplicate_result', // Bot 复制的结果
  bot_submit = 'bot_submit',
  bot_submit_difference = 'bot_submit_difference',
  bot_submit_confirm_click = 'bot_submit_confirm_click',
  bot_publish_difference = 'bot_publish_difference',
  bot_merge_page = 'bot_merge_page',
  bot_merge = 'bot_merge',
  bot_diff_viewdetail = 'bot_diff_viewdetail',
  bot_merge_manual = 'bot_merge_manual',
  workspace_action_front = 'workspace_action_front',
  search_front = 'search_front',
  //商品曝光
  product_show = 'product_show',
  product_click = 'product_click',
  //bot商品曝光
  product_show_front = 'product_show_front',
  product_click_front = 'product_click_front',
  click_open_in_front = 'click_open_in_front',
  favorite_click_front = 'favorite_click_front',

  // 商品操作事件
  product_run_front = 'product_run_front',

  // 素材商店上架
  entity_publish_click_front = 'entity_publish_click_front',

  // bot详情
  share_front = 'share_front',
  bot_detail_page_front = 'bot_detail_page_front',
  share_recall_page_front = 'share_recall_page_front', // 分享回流

  // Bot研发埋点
  dev_bot_share_screenshot_front = 'dev_bot_share_screenshot_front', // Bot分享截图

  // TTS
  bot_tts_configure = 'bot_tts_configure', // TTS 开关配置
  bot_tts_select_click = 'bot_tts_select_click', // 选择音色按钮的点击
  bot_tts_select_confirm = 'bot_tts_select_confirm', // 选择音色确认按钮的点击

  // 语音通话
  voice_chat_call = 'voice_chat_call',
  voice_chat_opening_dialog = 'voice_chat_opening_dialog',
  voice_chat_connect = 'voice_chat_connect',
  voice_chat_record = 'voice_chat_record',
  voice_chat_think = 'voice_chat_think',
  voice_chat_speak = 'voice_chat_speak',
  voice_chat_hang_up = 'voice_chat_hang_up',
  voice_chat_error = 'voice_chat_error',

  // token激励
  task_click = 'task_click', // 任务按钮点击
  task_show = 'task_show', // 任务展现
  buy_token_click = 'coze_token_buy_click', // 点击购买token按钮
  choose_amount_click = 'coze_token_buy_amount_click', // 选择token购买额度
  confirm_checkout_click = 'coze_token_buy_confirm_click', // 确认发起支付

  token_insufficiency_pop_up = 'token_insufficiency_pop_up', // coze token不足
  // publish 埋点
  click_auto_gen_changelog_button = 'click_auto_gen_changelog_button',
  click_stop_auto_gen_changelog_button = 'click_stop_auto_gen_changelog_button',
  auto_gen_changelog_finish = 'auto_gen_changelog_finish',
  bot_publish = 'bot_publish',
  bot_publish_button_click = 'bot_publish_button_click', // 发布按钮点击
  bot_publish_audit_pop_up = 'bot_publish_audit_pop_up', // 发布审核拦截弹窗

  // 运营 banner
  banner_expose_front = 'banner_expose_front',
  banner_click_front = 'banner_click_front',
  banner_close_front = 'banner_close_front',

  // nl2db
  recommended_table_click = 'recommended_table_click',
  nl2table_create_table_click = 'nl2table_create_table_click',
  generate_with_ai_click = 'generate_with_ai_click',
  database_learn_click = 'database_learn_click',
  create_table_click = 'create_table_click',
  edit_table_click = 'edit_table_click',

  // mockset 埋点
  create_mockset_front = 'create_mockset_front',
  del_mockset_front = 'del_mockset_front',
  create_mock_front = 'create_mock_front',
  del_mock_front = 'del_mock_front',
  use_mockset_front = 'use_mockset_front',
  use_mockgen_front = 'use_mockgen_front',

  // plugin隐私声明
  privacy_plugin_popup_front = 'privacy_plugin_popup_front',
  privacy_plugin_form_front = 'privacy_plugin_form_front',
  privacy_plugin_form_server = 'privacy_plugin_form_server',
  privacy_store_privacy_front = 'privacy_store_privacy_front',
  // 引导弹窗
  bot_desc_dialog_front = 'bot_desc_dialog_front',
  // plugin/tool导入导出
  create_plugin_front = 'create_plugin_front',
  create_plugin_tool_front = 'create_plugin_tool_front',
  code_snippet_front = 'code_snippet_front',

  // Workflow调测优化需求[PRD]()
  /** 节点单独调试 */
  workflow_test_node = 'workflow_test_node',
  /** 创建测试集成功 */
  workflow_create_testset = 'workflow_create_testset',
  /** AI生成入参 */
  workflow_aigc_params = 'workflow_aigc_params',
  /** TestRun时的数据来源 */
  workflow_testrun_source = 'workflow_testrun_source',
  /**
   * workflow Testrun结果
   * 
   */
  workflow_testrun_result_front = 'workflow_testrun_result_front',
  /**
   * ! workflow Testrun节点详情, 当前仅定义, 未埋点
   * 
   */
  workflow_testrun_detailed_front = 'workflow_testrun_detailed_front',
  /** 预发布按钮点击 */
  workflow_pre_release_ppe = 'workflow_pre_release_ppe',
  /** ppe 发布版本选择 */
  workflow_ppe_version_select = 'workflow_ppe_version_select',
  /** 发布 ppe 环境 */
  workflow_ppe_release_event = 'workflow_ppe_release_event',
  /** 历史版本展示 */
  workflow_history_show = 'workflow_history_show',
  /** 环境删除 */
  workflow_ppe_offline = 'workflow_ppe_offline',
  /* 点击_workflow版本提交 */
  workflow_submit = 'workflow_submit',
  /* 点击_查看 workflow submit difference */
  workflow_submit_difference = 'workflow_submit_difference',
  /* 点击_查看 workflow publish difference */
  workflow_publish_difference = 'workflow_publish_difference',
  /* 浏览_workflow merge */
  workflow_merge_page = 'workflow_merge_page',
  /* 点击_合并 */
  workflow_merge = 'workflow_merge',
  /* 浏览_workflow 提交版本列表 */
  workflow_submit_version_history = 'workflow_submit_version_history',
  /* 点击_恢复 workflow 提交版本 */
  workflow_submit_version_revert = 'workflow_submit_version_revert',
  /* 点击_查看 workflow 提交版本 */
  workflow_submit_version_view = 'workflow_submit_version_view',
  /* 点击workflow协作开关 */
  workflow_cooperation_switch_click = 'workflow_cooperation_switch_click',
  /* 帮助文档 */
  workflow_test_run_click = 'workflow_test_run_click',

  // widget 埋点
  widget_create_click = 'widget_create_click',
  widget_duplicate_click = 'widget_duplicate_click',
  widget_delete_click = 'widget_delete_click',

  // devops -> query-trace
  analytics_tab_view = 'analytics_tab_view',
  analytics_tab_view_duration = 'analytics_tab_view_duration',
  // 列表页
  query_trace_list_view = 'query_trace_list_view',
  query_trace_columns_update = 'query_trace_columns_update',
  query_trace_filters_update = 'query_trace_filters_update',
  query_trace_quick_filter_status_update = 'query_trace_quick_filter_status_update',
  query_trace_quick_filter_latency_update = 'query_trace_quick_filter_latency_update',
  query_trace_quick_filter_tokens_update = 'query_trace_quick_filter_tokens_update',
  query_trace_quick_filter_full_text_search = 'query_trace_quick_filter_full_text_search',
  query_trace_detail_view = 'query_trace_detail_view',
  query_trace_row_click = 'query_trace_row_click',
  query_new_trace_csv_export = 'query_new_trace_csv_export',
  query_new_trace_columns_update = 'query_new_trace_columns_update',
  query_new_trace_list_view = 'query_new_trace_list_view',
  query_new_trace_row_click = 'query_new_trace_row_click',
  query_new_trace_detail_view = 'query_new_trace_detail_view',
  query_new_trace_quick_filter_status_update = 'query_new_trace_quick_filter_status_update',
  query_new_trace_quick_filter_message_ids_update = 'query_new_trace_quick_filter_message_ids_update',
  query_new_trace_quick_filter_user_ids_update = 'query_new_trace_quick_filter_user_ids_update',
  query_new_trace_quick_filter_session_ids_update = 'query_new_trace_quick_filter_session_ids_update',
  query_new_trace_quick_filter_input_update = 'query_new_trace_quick_filter_input_update',
  query_new_trace_quick_filter_output_update = 'query_new_trace_quick_filter_output_update',
  query_new_trace_quick_filter_intent_update = 'query_new_trace_quick_filter_intent_update',
  query_new_trace_quick_filter_input_tokens_update = 'query_new_trace_quick_filter_input_tokens_update',
  query_new_trace_quick_filter_output_tokens_update = 'query_new_trace_quick_filter_output_tokens_update',
  query_new_trace_quick_filter_latency_update = 'query_new_trace_quick_filter_latency_update',
  query_new_trace_quick_filter_latency_first_resp_update = 'query_new_trace_quick_filter_latency_first_resp_update',
  query_new_trace_quick_filter_time_update = 'query_new_trace_quick_filter_time_update',

  // 详情页
  query_trace_graph_tab_click = 'query_trace_graph_tab_click',
  query_trace_tree_node_click = 'query_trace_tree_node_click',
  query_trace_flamethread_node_click = 'query_trace_flamethread_node_click',
  query_trace_input_copy = 'query_trace_input_copy',
  query_trace_output_copy = 'query_trace_output_copy',
  // 年龄门
  age_gate_show = 'age_gate_show',
  age_gate_click = 'age_gate_click',
  // 调试台
  open_debug_panel = 'open_debug_panel',
  debug_page_show = 'debug_page_show',

  // 智能分析助手
  ai_analysis_assistant_entry_click = 'ai_analysis_assistant_entry_click',
  ai_analysis_assistant_send_click = 'ai_analysis_assistant_send_click',
  // devops -> performance
  performance_view = 'performance_view',
  // devops - query分析
  query_analytics_select_channel = 'query_analytics_select_channel',
  query_analytics_intent_jump_queries = 'query_analytics_intent_jump_queries',
  // devops - 运营指标
  analysis_indicator_interval = 'analysis_indicator_interval',
  analysis_indicator_auto_refresh_interval = 'analysis_indicator_auto_refresh_interval',

  // 评测
  create_dataset = 'create_dataset',
  create_rule = 'create_rule',
  add_rule_type = 'add_rule_type',
  create_case = 'create_case',
  case_result = 'case_result',

  get_start = 'get_start',

  // coze-dev bot多版本在线
  bot_deployment_details = 'bot_deployment_details',
  bot_pre_release_ppe = 'bot_pre_release_ppe',
  bot_ppe_version_select = 'bot_ppe_version_select',
  bot_ppe_release_event = 'bot_ppe_release_event',
  bot_history_show = 'bot_history_show',
  bot_ppe_offline = 'bot_ppe_offline',
  bot_gray_publish = 'bot_gray_publish',

  // 搜索
  store_search_page_front = 'store_search_page_front',
  store_search_front = 'store_search_front',

  // 商品讨论区
  content_show_front = 'content_show_front',
  content_click_front = 'content_click_front',

  // 个人主页
  profile_entrance = 'profile_entrance',
  profile_share = 'profile_share',
  profile_follow = 'profile_follow',

  //专题
  share_topic = 'share_topic',
  landing_topic = 'landing_topic',
  collect_topic = 'collect_topic',
  view_all = 'view_all',
  click_topic = 'click_topic',

  //切换语言
  language_switch_show = 'language_switch_show',
  language_switch_click = 'language_switch_click',
  // bot竞技场
  arena_bot_show_front = 'arena_bot_show_front',
  arena_bot_click_front = 'arena_bot_click_front',
  arena_bot_front = 'arena_bot_front',
  arena_click_front = 'arena_click_front',
  question_bank_click_front = 'question_bank_click_front',
  // memory
  memory_click_front = 'memory_click_front',
  click_debug_panel_feedback_button = 'click_debug_panel_feedback_button',

  // flow store
  flow_store_list_click = 'flow_store_list_click',
  flow_store_detail_click = 'flow_store_detail_click',

  // 流程商店 
  flow_creation_click = 'flow_creation_click',
  flow_duplicate_click = 'flow_duplicate_click',
  // 评测
  eval_panel_show = 'coze_panel_show',
  eval_task_operation = 'eval_task_operation',
  eval_panel_tab_show = 'eval_panel_tab_show',
  eval_result_show = 'eval_result_show',
  eval_result_tab_show = 'eval_result_tab_show',
  eval_result_detail_sort = 'eval_result_detail_sort',
  // 快捷指令
  shortcut_use = 'shortcut_use',
  // 多模态预览
  preview_link_click = 'preview_link_click',
  // nl2prompt
  prompt_optimize_front = 'prompt_optimize_front',
  // home 2.0
  home_action_front = 'home_action_front',
  template_action_front = 'template_action_front',
  // coze assistant
  coze_agent_front = 'coze_agent_front',
  // 首页通知相关埋点
  notification_front = 'notification_front',
  notification_center_show_front = 'notification_center_show_front',
  notification_center_click_front = 'notification_center_click_front',
  // 专业版相关埋点
  coze_pro_popup_front = 'coze_pro_popup_front', // 专业版权益弹窗
  coze_landing_front = 'coze_landing_front', // coze主页点击登录按钮

  add_member_pop_up_show = 'add_member_pop_up_show_front',
  oauth_page_stay_time_front = 'oauth_page_stay_time_front', //	OAuth授权页面停留时长
  oauth_page_show_front = 'oauth_page_show_front', //	OAuth授权页面展示
  oauth_page_click_front = 'oauth_page_click_front', // OAuth授权页面点击
  account_upgrade_page_show_front = 'account_upgrade_page_show_front', //	升级成功弹窗展示
  account_upgrade_page_click_front = 'account_upgrade_page_click_front', // 升级成功弹窗点击

  coze_pro_popup_plan_buy_token = 'coze_pro_popup_plan_buy_token', // 购买资源点

  // playground埋点
  playground_click_front = 'playground_click_front', // 点击事件
  playground_set_front = 'playground_set_front', // 配置行为上报
  playground_authorize_front = 'playground_authorize_front', // 授权行为上报
  // coze-doc埋点
  doc_click_front = 'doc_click_front', // 点击事件
  docs_page_view_front = 'docs_page_view_front', // 文档页面浏览

  // 渠道 OAuth 授权埋点
  publish_oauth_button_click = 'publish_oauth_button_click',
  settings_oauth_page_show = 'settings_oauth_page_show',
  settings_oauth_button_click = 'settings_oauth_button_click',

  // 提示词相关埋点
  prompt_library_front = 'prompt_library_front', // 提示词资源相关前端埋点

  // 对比相关埋点
  compare_mode_front = 'compare_mode_front', // 对比相关前端埋点

  // 通用站点切换点击
  site_change_click = 'site_change_click',
}

export interface SiteChangeClickParams {
  url: string;
  full_url: string;
  userid: string;
  environment: string;
}

export interface PlaygroundClickCommonParams {
  user_id?: string;
  full_url: string;
  action: 'modify' | 'click_run';
}

export interface DocClickCommonParams {
  user_id?: string;
  action: 'share' | 'click_text' | 'helpful' | 'search';
  full_url: string;
  share_target?: 'title' | 'anchor';
  feedback_log?: string;
  search_words?: string;
  helpful_type?: '1' | '0';
}

// explore bot 卡片通用埋点参数
export interface ExploreBotCardCommonParams {
  bot_id?: string;
  bot_name?: string;
  from?: 'explore_card';
  source?: 'explore_card' | 'explore_bot_detailpage';
  c_position?: number;
  category_name?: string;
  category_id?: string;
  filter_tag?: string;
}

export type ShareRecallPageFrom =
  | 'x'
  | 'reddit'
  | 'others'
  | 'weibo'
  | 'juejin'
  | 'image'
  | 'qzone'
  | 'wechat'
  | 'home_url';

export interface PluginMockSetCommonParams {
  environment?: string;
  workspace_id?: string;
  workspace_type?: 'personal_workspace' | 'team_workspace';
  tool_id?: string;
  mock_set_id?: string;
  status?: 0 | 1;
  error?: string;
}

export interface CozeDevPublishCommonParams {
  environment: string;
  workspace_id: string;
  bot_id: string;
  status: 0 | 1;
}

export interface SideNavClickCommonParams {
  need_login: boolean;
  have_access: boolean;
}

interface TimezoneLogParams {
  timezone: string;
}
/** Int64类型其实是 string | number */
type StrOrNumber = Int64;

export enum AddPluginToStoreEntry {
  'PLUGIN_SPACE' = 'plugin_space',
  'PLUGIN_CARD' = 'plugin_card',
  'PLUGIN_DETAILPAGE' = 'plugin_detailpage',
}

export enum AddBotToStoreEntry {
  'EXPLORE_CARD' = 'explore_card',
  'EXPLORE_BOT_DETAILPAGE' = 'explore_bot_detailpage',
  'BOTS_CARD' = 'bots_card',
  'BOTS_DETAILPAGE' = 'bots_detailpage',
  'BOTS_STORE' = 'bots_store',
  'BOTS_PUBLISH' = 'bots_publish',
}

// 埋点
export enum AddWorkflowToStoreEntry {
  'EXPLORE_CARD' = 'explore_card',
  'EXPLORE_WORKFLOW_DETAILPAGE' = 'explore_workflow_detailpage',
  'WORKFLOW_CARD' = 'workflow_card',
  'WORKFLOW_DETAILPAGE' = 'workflow_detailpage',
  'WORKFLOW_STORE' = 'workflow_store',
  'WORKFLOW_PUBLISH' = 'workflow_publish',
  'WORKFLOW_PERSONAL_LIST' = 'worflow_personal_list',
}

export enum PublishAction {
  Click = 1, // 点击上架
  Confirm = 2, // 确认上架
  Remove = 3, // 确定下架
  Resume = 4, // 恢复上架
}

export enum BotDetailPageAction {
  ClickInput = 1,
  ClickHistory = 2,
  PageView = 3,
  ClickContinueToChat = 4,
  AddToDesktop = 5,
  AddToDesktopSuc = 6,
  ClickVoiceBtnOn = 7,
  ClickVoiceBtnOff = 8,
}

export enum PluginPrivacyAction {
  Show = 1, // 弹窗展示
  Cancel = 2, // 取消
  Confirm = 3, // 确定
  Close = 4, // 关闭
}

export enum PluginMockDataGenerateMode {
  MANUAL = 0, // 手动创建
  RANDOM = 1, // 随机生成
  LLM = 2, // 大模型生成
}

export enum BotShareConversationClick {
  CopyLink = 1,
  CopyImage = 2,
  DownloadImage = 3,
}

/**
 * UG 线索回传参数
 * 
 */
export interface UserGrowthEventParams {
  /**
   * 实际收到用户访问时的完整 url
   */
  LandingPageUrl: string;
  /**
   * 与 UG 约定的 AppId
   */
  AppId: number;
  /**
   * 与 UG 约定的 EventName
   */
  EventName: string;
  /**
   * 秒时间戳 Math.floor(Date.now() / 1000)
   */
  EventTs: number;
  /**
   * 固定值 '4'
   */
  growth_deepevent: '4';
}

export interface ParamsTypeDefine {
  [EVENT_NAMES.page_from]: {
    url: string;
    page_from: string;
  };
  [EVENT_NAMES.page_view]: {
    need_login: boolean; // 访问当前 URL 是否需要登录
    have_access: boolean; // 是否在 waitlist 中
    URL: string;
    is_inhouse: boolean;
    full_url: string;
    environment:
      | 'cn-inhouse'
      | 'cn-release'
      | 'oversea-inhouse'
      | 'oversea-release'
      | 'cn-boe';
    second_environment?: 'cn-coze-pro' | 'cn-coze-basic';
  };
  // see 
  [EVENT_NAMES.view_bot]: { tab: 'my_bots' | 'starred_bots' };
  [EVENT_NAMES.view_database]: never;
  [EVENT_NAMES.click_create_bot_confirm]: {
    click: 'success' | 'failed';
    bot_id?: string;
    error_message?: string;
    create_type?: 'duplicate' | 'create';
    from?: 'explore_card';
    source?: 'explore_bot_detailpage';
  };
  [EVENT_NAMES.click_prompt_edit]: {
    bot_id?: string;
  };
  [EVENT_NAMES.click_tool_select]: {
    operation: 'add' | 'remove';
    bot_id?: string;
    operation_type: 'all' | 'single';
    tool_id: string;
    tool_name: string;
    product_id?: string;
    product_name?: string;
    source: 'add_to_my_bot' | 'add_plugin_list' | 'auto_add';
    from?:
      | 'explore_plugin_detailpage'
      | 'bot_develop'
      | 'workflow_develop'
      | 'add_plugin_list'
      | 'explore_card';
  };
  [EVENT_NAMES.click_database_select]: {
    operation: 'add' | 'remove';
    bot_id?: string;
  };
  [EVENT_NAMES.click_welcome_message_edit]: {
    type: 'welcome_message' | 'suggestion';
    bot_id?: string;
  };
  [EVENT_NAMES.click_send_message]: {
    from: 'type' | 'welcome_message_suggestion' | 'regenerate';
    is_user_owned: 'true' | 'false';
    bot_id?: string;
    message_id: string;
  };
  [EVENT_NAMES.delete_rec_plugin]: {
    bot_id?: string;
    plugin_id?: string;
    api_name?: string;
  };
  [EVENT_NAMES.submit_rec_plugin]: {
    bot_id?: string;
    plugin_id?: string[];
    api_name?: string[];
  };
  [EVENT_NAMES.bot_show]: ExploreBotCardCommonParams;
  [EVENT_NAMES.bot_click]: ExploreBotCardCommonParams;
  [EVENT_NAMES.click_bot_duplicate]: ExploreBotCardCommonParams;
  [EVENT_NAMES.bot_duplicate_click_front]: {
    bot_type: string;
    from: string;
    source: string;
    bot_id?: string;
    bot_name?: string;
    category_name?: string;
    category_id?: string;
  };
  [EVENT_NAMES.coze_space_sidenavi_ck]: SideNavClickCommonParams & {
    item: string;
    navi_type: 'prime' | 'second';
    category?: 'home_favourite' | 'space_favourite' | 'recent';
  };
  [EVENT_NAMES.binding_card_list]: {
    type?: string;
    scope?: string;
    name?: string;
    card_id?: string;
    card_version?: string;
    action?: string;
  };
  [EVENT_NAMES.binding_card_add]: {
    type?: string;
  };
  [EVENT_NAMES.binding_card_update]: {
    type?: string;
    card_id?: string;
    card_version?: string;
  };
  [EVENT_NAMES.binding_card_preview]: {
    type?: string;
    card_id?: string;
    card_version?: string;
  };
  [EVENT_NAMES.builder_editor_view]: {
    type?: string;
    duration?: number;
    action?: string;
  };
  [EVENT_NAMES.builder_plugin_info]: {
    type: string;
    action: string;
  };
  [EVENT_NAMES.builder_plugin_channel]: {
    type: string;
    channel: string;
  };
  [EVENT_NAMES.builder_plugin_var]: {
    type: string;
    position: string;
    action: string;
  };
  [EVENT_NAMES.builder_plugin_structure]: {
    type: string;
    comp_name: string;
  };
  [EVENT_NAMES.builder_plugin_component]: {
    type: string;
    npm_name?: string;
    npm_ver?: string;
    comp_name?: string;
  };
  [EVENT_NAMES.builder_plugin_canvas]: {
    type: string;
    device?: string;
    action?: string;
  };
  [EVENT_NAMES.builder_plugin_set]: {
    type: string;
    npm_name: string;
    npm_ver: string;
    comp_name: string;
    props: string;
  };
  [EVENT_NAMES.builder_plugin_preview]: {
    type: string;
    channel?: string;
  };
  [EVENT_NAMES.builder_plugin_publish]: {
    type: string;
    cover?: string;
  };
  [EVENT_NAMES.builder_plugin_template]: {
    type: string;
    action?: string;
    template_name?: string;
    template_type?: any;
  };
  [EVENT_NAMES.builder_plugin_copilot_enter_click]: {
    type: string;
    action?: string;
  };
  [EVENT_NAMES.builder_plugin_copilot_gen_click]: {
    type: string;
    action?: string;
  };
  [EVENT_NAMES.BuilderPluginStructure]: {
    type: string;
    comp_name: string;
  };
  [EVENT_NAMES.BuilderPluginCanvas]: {
    type: string;
    device?: string;
    action?: string;
  };
  [EVENT_NAMES.ui_builder_exposure]: {
    user_id: string;
    ui_type: ChannelType;
    ui_id: string;
    project_id: string;
  };
  [EVENT_NAMES.ui_builder_initialization]: {
    ui_id: string;
    project_id: string;
    ui_type: ChannelType;
    user_id: string;
  };
  [EVENT_NAMES.ui_builder_component_usage]: {
    ui_type: ChannelType;
    ui_id: string;
    project_id: string;
    component_name: string;
  };
  [EVENT_NAMES.ui_builder_setter_usage]: {
    setter_name: string;
    setter_type: string;
    ui_type: ChannelType;
    ui_id: string;
    project_id: string;
  };
  [EVENT_NAMES.cookie_click]: {
    type: string;
    device?: string;
    action?: string;
    is_login?: string;
    uid?: string;
    country_code?: string;
  };
  [EVENT_NAMES.cookie_show]: {
    type: string;
    device?: string;
    action?: string;
    is_login?: string;
    uid?: string;
    country_code?: string;
  };
  [EVENT_NAMES.card_webruntime_view]: {
    type?: string;
  };
  [EVENT_NAMES.card_webruntime_render]: {
    duration: number;
  };
  [EVENT_NAMES.card_webruntime_error]: {
    code: number;
    msg: string;
  };
  [EVENT_NAMES.builder_editor_show]: {
    source?: 'page' | 'modal';
  };
  [EVENT_NAMES.card_builder_show]: {
    source?: 'page' | 'modal';
  };
  [EVENT_NAMES.task_click]: {
    task_id: string;
  };
  [EVENT_NAMES.task_show]: {
    task_id: string;
  };
  [EVENT_NAMES.select_scheduled_tasks_timezone]: TimezoneLogParams;
  [EVENT_NAMES.log_not_supported_timezone]: TimezoneLogParams;
  [EVENT_NAMES.home_page_view]: { source: string };
  [EVENT_NAMES.tab_click]: {
    content: string;
    workspace_id?: string;
  };
  [EVENT_NAMES.workspace_tab_expose]: {
    tab_name: string;
  };

  // #region 团队空间 参数
  [EVENT_NAMES.create_workspace_click]: Record<string, never>;
  [EVENT_NAMES.create_workspace_result]: {
    result: 'success' | 'failed';
    error_code?: string;
    error_message?: string;
    workspace_name?: string;
    workspace_desc?: string;
  };
  [EVENT_NAMES.enterprise_switch_child_create_space_click]: {
    action: 'enable' | 'disable';
  };
  [EVENT_NAMES.enterprise_switch_add_outside_user_click]: {
    action: 'enable' | 'disable';
  };
  [EVENT_NAMES.enterprise_switch_join_outside_space_click]: {
    action: 'enable' | 'disable';
  };
  [EVENT_NAMES.space_switch_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_switch_click]: {
    current_space_id: string;
    to_space_id: string;
  };
  [EVENT_NAMES.space_admins_button_click]: { current_space_id: string };
  [EVENT_NAMES.space_members_page_show]: { current_space_id: string };
  [EVENT_NAMES.space_members_page_click]: {
    current_space_id: string;
    action:
      | 'filter'
      | 'role_distribute'
      | 'remove'
      | 'share_link'
      | 'add'
      | 'search';
  };
  [EVENT_NAMES.space_invitation_page_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_invitation_page_click]: {
    current_space_id: string;
    action: 'filter' | 'revoke' | 'search' | 'share_link' | 'add';
  };
  [EVENT_NAMES.space_settings_page_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_settings_page_click]: {
    current_space_id: string;
    action:
      | 'switch_enable'
      | 'switch_disable'
      | 'transfer'
      | 'delete'
      | 'leave';
  };
  [EVENT_NAMES.space_settings_button_click]: {
    current_space_id: string;
    action: 'leave';
  };
  [EVENT_NAMES.space_share_link_popup_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_share_link_popup_click]: {
    current_space_id: string;
    action: 'open_url' | 'close_url' | 'copy' | 'close';
  };
  [EVENT_NAMES.space_add_members_popup_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_add_members_popup_click]: {
    current_space_id: string;
    action: 'search' | 'create_child' | 'cancel' | 'confirm' | 'close';
  };
  [EVENT_NAMES.space_member_remove_pop_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_member_remove_pop_click]: {
    current_space_id: string;
    action: 'confirm' | 'cancel';
  };
  [EVENT_NAMES.space_invitation_revoke_pop_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_invitation_revoke_pop_click]: {
    current_space_id: string;
    action: 'revoke' | 'cancel';
  };
  [EVENT_NAMES.space_settings_secondary_pop_show]: {
    current_space_id: string;
  };
  [EVENT_NAMES.space_settings_secondary_pop_click]: {
    current_space_id: string;
    action: 'leave' | 'cancel' | 'close';
  };
  // #endregion

  [EVENT_NAMES.create_bot_click]: {
    source: string;
    workspace_type?: string;
  };
  [EVENT_NAMES.create_bot_result]: {
    source: string;
    workspace_type: string;
    result: string;
    error_code?: StrOrNumber;
    error_message?: string;
    bot_name: string;
    bot_desc: string;
  };
  [EVENT_NAMES.bot_duplicate_click]: {
    bot_type: string;
  };
  [EVENT_NAMES.bot_duplicate_result]: {
    bot_type: string;
    workspace_type: string;
    result: string;
    error_code?: StrOrNumber;
    error_message?: string;
    bot_name: string;
  };
  [EVENT_NAMES.product_show]: {
    product_id: string;
    product_name: string;
    entity_type: 'bot' | 'plugin';
    source: 'explore_card' | 'explore_plugin_detailpage' | 'add_plugin_list';
    from?: 'explore_card' | 'add_plugin_list';
    filter_tag?: string;
  };
  [EVENT_NAMES.product_click]: {
    product_id: string;
    product_name: string;
    entity_type: 'bot' | 'plugin';
    source: 'explore_card' | 'explore_plugin_detailpage' | 'add_plugin_list';
    from?: 'explore_card' | 'add_plugin_list';
    filter_tag: string;
    action?: 'enter_detailpage' | 'expand_tools';
  };
  [EVENT_NAMES.product_show]: {
    product_id: string;
    product_name: string;
    entity_type: 'bot' | 'plugin';
    source: 'explore_card' | 'explore_plugin_detailpage' | 'add_plugin_list';
    from?: 'explore_card' | 'add_plugin_list';
    filter_tag?: string;
  };
  [EVENT_NAMES.product_click]: {
    product_id: string;
    product_name: string;
    entity_type: 'bot' | 'plugin';
    source: 'explore_card' | 'explore_plugin_detailpage' | 'add_plugin_list';
    from?: 'explore_card' | 'add_plugin_list';
    filter_tag: string;
    action?: 'enter_detailpage' | 'expand_tools';
  };
  [EVENT_NAMES.click_auto_gen_changelog_button]: {
    bot_id: string;
    space_id: string;
    publish_id: string;
    workspace_id: string;
    workspace_type: string;
    trigger_type?: string;
  };
  [EVENT_NAMES.bot_tts_configure]: {
    bot_id: string;
    status: string;
  };
  [EVENT_NAMES.bot_tts_select_click]: {
    bot_id: string;
  };
  [EVENT_NAMES.bot_tts_select_confirm]: {
    bot_id: string;
    selected_voice_cnt: number;
    selected_voice: string;
  };
  [EVENT_NAMES.click_stop_auto_gen_changelog_button]: {
    bot_id: string;
    space_id: string;
    publish_id: string;
    workspace_id: string;
    workspace_type: string;
  };
  [EVENT_NAMES.auto_gen_changelog_finish]: {
    bot_id: string;
    space_id: string;
    publish_id: string;
    duration: number;
    workspace_id: string;
    workspace_type: string;
  };
  [EVENT_NAMES.bot_publish]: {
    bot_id: string;
    space_id: string;
    publish_id: string;
    is_auto_gen_changelog_empty: boolean;
    is_changelog_empty: boolean;
    is_modified: boolean;
    workspace_id: string;
    workspace_type: string;
    gen_changelog_trigger_type?: string;
  };
  [EVENT_NAMES.bot_publish_button_click]: {
    bot_id: string;
    bot_name: string;
  };
  [EVENT_NAMES.bot_publish_audit_pop_up]: {
    bot_id: string;
    bot_name: string;
  };

  //商品bot
  [EVENT_NAMES.product_show_front]: ProductShowFrontParams;
  [EVENT_NAMES.product_run_front]: ProductRunFrontParams;
  [EVENT_NAMES.product_click_front]: ProductClickFrontParams;
  [EVENT_NAMES.favorite_click_front]: {
    entity_type: 'bot' | 'plugin' | 'project';
    action: 'add' | 'cancel';
    source:
      | 'plugin_card'
      | 'plugin_detailpage'
      | 'add_plugin_menu'
      | 'bots_card'
      | 'bots_detailpage'
      | 'bots_store'
      | 'bots_publish'
      | 'search_card';
    from?: string;
    product_id: string;
    bot_id?: string;
    plugin_id?: string;
    product_name: string;
  };
  [EVENT_NAMES.click_open_in_front]: {
    connector_id: string;
    connector_name: string;
    product_id: string;
    product_name: string;
    bot_id: string;
    source:
      | 'explore_card'
      | 'explore_plugin_detailpage'
      | 'bots_card'
      | 'bots_detailpage'
      | 'bots_store'
      | 'bots_publish'
      | 'recall_page';
    from?: string;
  };
  [EVENT_NAMES.entity_publish_click_front]: {
    entity_type: 'bot' | 'plugin' | 'workflow';
    from: AddBotToStoreEntry | AddPluginToStoreEntry | AddWorkflowToStoreEntry;
    source:
      | AddBotToStoreEntry
      | AddPluginToStoreEntry
      | AddWorkflowToStoreEntry;
    submit_type: 'first' | 'update';
    entity_id?: string;
    product_id?: string;
    product_name?: string;
    publish_action: PublishAction;
    release_entrance?: string;
  };
  [EVENT_NAMES.share_front]: {
    bot_id?: string;
    share_item_type: 'bot_history_conversation' | 'bot' | 'arena';
    share_source?:
      | 'X'
      | 'Reddit'
      | 'image'
      | 'wechat'
      | 'weibo'
      | 'juejin'
      | 'Qzone'
      | 'forum'
      | 'others'
      | 'home_link'
      | 'home_conversation';
    share_click:
      | 'add_recommended_conversation'
      | 'share_conversation'
      | 'bot_share'
      | 'arena_share'
      | 'arena_result'
      | 'home_share'
      | 'home_action'
      | 'answer_action';
    share_conversation_click?: BotShareConversationClick;
    is_share?: 1 | 0;
    source: string;
    from: string;
    bid?: string;
    share_id?: string;
  };
  [EVENT_NAMES.bot_detail_page_front]: {
    bot_id?: string;
    product_id?: string;
    product_name?: string;
    source?: string;
    from?: string;
    is_history?: 1 | 0;
    action?: BotDetailPageAction;
    result?: 'sucess' | 'review_fail' | 'others' | '';
    entity_type?: 'bot' | 'plugin';
  };
  [EVENT_NAMES.token_insufficiency_pop_up]: Record<string, unknown>;
  [EVENT_NAMES.buy_token_click]: Record<string, unknown>;
  [EVENT_NAMES.choose_amount_click]: Record<string, unknown>;
  [EVENT_NAMES.confirm_checkout_click]: Record<string, unknown>;
  [EVENT_NAMES.banner_expose_front]: {
    banner_content: string;
    full_url: string;
  };
  [EVENT_NAMES.banner_click_front]: {
    banner_content: string;
    full_url: string;
  };
  [EVENT_NAMES.banner_close_front]: {
    banner_content: string;
    full_url: string;
  };
  [EVENT_NAMES.bot_merge]: Record<string, unknown>;
  [EVENT_NAMES.bot_merge_page]: Record<string, unknown>;
  [EVENT_NAMES.bot_submit_difference]: Record<string, unknown>;
  [EVENT_NAMES.bot_publish_difference]: Record<string, unknown>;
  [EVENT_NAMES.bot_submit]: Record<string, unknown>;
  [EVENT_NAMES.bot_diff_viewdetail]: {
    workspace_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.bot_merge_manual]: {
    workspace_id: string;
    bot_id: string;
    submit_or_not: boolean;
  };
  [EVENT_NAMES.share_recall_page_front]: {
    bot_id: string;
    action: 'get_started' | 'page_view' | 'is_continue' | 'page_view';
    full_url: string;
    from?: ShareRecallPageFrom;
    is_continue?: 0 | 1;
  };
  [EVENT_NAMES.recommended_table_click]: {
    have_access: boolean;
    need_login: boolean;
    bot_id: string;
  };
  [EVENT_NAMES.nl2table_create_table_click]: {
    have_access: boolean;
    need_login: boolean;
    bot_id: string;
  };
  [EVENT_NAMES.generate_with_ai_click]: {
    have_access: boolean;
    need_login: boolean;
    bot_id: string;
  };
  [EVENT_NAMES.database_learn_click]: {
    have_access: boolean;
    need_login: boolean;
    bot_id: string;
  };
  [EVENT_NAMES.create_table_click]: {
    have_access: boolean;
    need_login: boolean;
    bot_id: string;
    table_name: string;
    database_create_type: string;
  };
  [EVENT_NAMES.edit_table_click]: {
    have_access: boolean;
    need_login: boolean;
    bot_id: string;
    table_name: string;
  };
  [EVENT_NAMES.create_mockset_front]: PluginMockSetCommonParams & {
    auto_gen_mode: PluginMockDataGenerateMode;
    mock_counts: number;
    error_type?: 'repeat_name' | 'unknown';
  };
  [EVENT_NAMES.del_mockset_front]: PluginMockSetCommonParams;
  [EVENT_NAMES.create_mock_front]: PluginMockSetCommonParams & {
    mock_counts: number;
  };
  [EVENT_NAMES.del_mock_front]: PluginMockSetCommonParams & {
    mock_counts: number;
  };
  [EVENT_NAMES.use_mockset_front]: PluginMockSetCommonParams & {
    where: 'flow' | 'agent' | 'bot';
  };
  [EVENT_NAMES.use_mockgen_front]: PluginMockSetCommonParams & {
    auto_gen_mode: PluginMockDataGenerateMode;
    gen_count: number;
  };
  [key: string]: unknown;
  [EVENT_NAMES.privacy_plugin_popup_front]: {
    user_id: string;
    plugin_id: string;
    plugin_status: string;
    action: PluginPrivacyAction;
  };
  [EVENT_NAMES.privacy_plugin_form_front]: {
    user_id: string;
    plugin_id: string;
    plugin_status: string;
    action: PluginPrivacyAction;
  };
  [EVENT_NAMES.privacy_plugin_form_server]: {
    user_id: string;
    plugin_id: string;
    plugin_status: string;
    result: 'fail' | 'success';
  };
  [EVENT_NAMES.privacy_store_privacy_front]: {
    user_id: string;
    plugin_id: string;
    plugin_status: string;
    action: string;
  };
  [EVENT_NAMES.bot_desc_dialog_front]: {
    bot_id: string;
    popup_id: string;
    popup_type: 'description' | 'dialog' | 'desc_dialog';
    action: 'popup_view' | 'generate' | 'confirm' | 'close' | 'skip';
    is_modified_desc?: boolean;
    is_modified_dialog?: boolean;
    generate_content?: 'dialog' | 'description';
  };
  [EVENT_NAMES.create_plugin_front]: {
    environment: string;
    workspace_id: string;
    workspace_type: string;
    status: number;
    create_type: string;
    import_format_type?: string;
    import_way_type?: string;
    import_tools_count?: number;
    error_message?: string;
  };
  [EVENT_NAMES.create_plugin_tool_front]: {
    environment: string;
    workspace_id: string;
    workspace_type: string;
    plugin_id: string;
    status: number;
    create_type: string;
    import_format_type?: string;
    import_way_type?: string;
    import_tools_count?: number;
    error_message?: string;
  };
  [EVENT_NAMES.code_snippet_front]: {
    environment: string;
    workspace_id: string;
    workspace_type: string;
    tool_id: string;
    code_type: string;
    status: number;
    error_message?: string;
  };
  [EVENT_NAMES.sign_up_front]: {
    utm_source?: string;
    utm_medium?: string;
    utm_source_platform?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    utm_id?: string;
    userid: string;
    new_user?: number;
    second_environment?: 'cn-coze-pro' | 'cn-coze-basic';
    method?: 'volcengine' | 'douyin' | 'google' | 'phone';
    result?: 'success' | 'failed';
    redirect_domain?: string;
    /** 从哪里登录的 */
    login_from?: string;
  };
  [EVENT_NAMES.workflow_test_node]: Record<string, unknown>;
  [EVENT_NAMES.workflow_create_testset]: Record<string, unknown>;
  [EVENT_NAMES.workflow_aigc_params]: Record<string, unknown>;
  [EVENT_NAMES.workflow_testrun_source]: Record<string, unknown>;
  [EVENT_NAMES.workflow_testrun_result_front]: {
    workflow_id: string;
    space_id: string;
    testrun_id?: string;
    /**
     * 操作类型
     * - testrun_start: 触发
     * - testrun_end: 结束
     * - manual_end: 用户取消
     */
    action: 'testrun_start' | 'testrun_end' | 'manual_end';
    results?: 'success' | 'fail';
    /**
     * 拦截端
     * - front_end: 前端拦截
     * - server_end: 后端拦截
     */
    fail_end?: 'front_end' | 'server_end';
    /**
     * 失败类型:
     * - flow_validate: 流程校验失败
     * - trigger_error: 触发 TestRun 失败
     * - save_flow_error: 流程保存失败
     * - run_error: 运行报错
     */
    errtype?:
      | 'flow_validate'
      | 'trigger_error'
      | 'save_flow_error'
      | 'run_error';
    errdetail?: string;
  };
  [EVENT_NAMES.workflow_testrun_detailed_front]: {
    workflow_id: string;
    space_id: string;
    testrun_id?: string;
    nodes_id: string;
    nodes_type: string;
    /**
     * 拦截端
     * - front_end: 前端拦截
     * - server_end: 后端拦截
     */
    fail_end?: 'front_end' | 'server_end';
    /** 失败类型 */
    nodes_errortype?: string;
    /** 失败详情 */
    nodes_errdetail?: string;
  };
  [EVENT_NAMES.workflow_pre_release_ppe]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * 入口类型:
     * - 0: 发布按钮下拉
     * - 1: 历史抽屉底部按钮
     * - 2: 历史卡片下拉菜单
     */
    channel: number;
  };
  [EVENT_NAMES.workflow_ppe_version_select]: {
    workspace_id: string;
    workflow_id: string;
  };
  [EVENT_NAMES.workflow_ppe_release_event]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * 状态：
     * - 0: 成功
     * - 1: 失败
     */
    status: number;
    ppe_lane: string;
    error_message?: string;
  };
  [EVENT_NAMES.workflow_history_show]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * 查看历史版本的入口：
     * - 0: workflowIDE入口
     * - 1: workflowIDE的PPE发布页面入口
     */
    from: number;
    /**
     * 查看历史版本的类型
     */
    channel: OperateType;
  };
  [EVENT_NAMES.workflow_ppe_offline]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * 状态：
     * - 0: 成功
     * - 1: 失败
     */
    status: number;
    ppe_lane: string;
    error_message?: string;
  };
  [EVENT_NAMES.workflow_submit]: {
    workflow_id: string;
    workspace_id: string;
  };
  [EVENT_NAMES.workflow_submit_difference]: {
    workflow_id: string;
    workspace_id: string;
  };
  [EVENT_NAMES.workflow_publish_difference]: {
    workflow_id: string;
    workspace_id: string;
  };
  [EVENT_NAMES.workflow_merge_page]: {
    workflow_id: string;
    workspace_id: string;
  };
  [EVENT_NAMES.workflow_merge]: {
    workflow_id: string;
    workspace_id: string;
    merge_type: string;
  };
  [EVENT_NAMES.workflow_submit_version_history]: {
    workflow_id: string;
    workspace_id: string;
  };
  [EVENT_NAMES.workflow_submit_version_revert]: {
    workflow_id: string;
    workspace_id: string;
    version_id: string;
  };
  [EVENT_NAMES.workflow_submit_version_view]: {
    workflow_id: string;
    workspace_id: string;
    version_id: string;
  };
  [EVENT_NAMES.workflow_cooperation_switch_click]: {
    workflow_id: string;
    workspace_id: string;
    switch_type: number;
  };
  [EVENT_NAMES.workflow_test_run_click]: {
    action: string;
    nodes_type: string;
  };
  [EVENT_NAMES.widget_create_click]: {
    source: 'menu_bar' | 'plugin_list';
    workspace_type?: 'personal_workspace' | 'team_workspace';
  };
  [EVENT_NAMES.widget_duplicate_click]: {
    source: 'menu_bar' | 'plugin_list';
    workspace_type?: 'personal_workspace' | 'team_workspace';
  };
  [EVENT_NAMES.widget_delete_click]: {
    source: 'menu_bar' | 'plugin_list';
    workspace_type?: 'personal_workspace' | 'team_workspace';
  };
  [EVENT_NAMES.open_debug_panel]: {
    path: 'preview_debug' | 'msg_debug' | 'shortcut_debug';
  };
  [EVENT_NAMES.debug_page_show]: {
    bot_id?: string;
    workspace_id?: string;
  };
  [EVENT_NAMES.create_dataset]: {
    bot_id: string;
    bot_name: string;
  };
  [EVENT_NAMES.create_case]: {
    bot_id: string;
    bot_name: string;
  };
  [EVENT_NAMES.create_rule]: {
    bot_id: string;
    bot_name: string;
  };
  [EVENT_NAMES.get_start]: {
    URL: string;
    is_login: boolean; // 访问当前 URL 是否需要登录
    action: 'click_get_started' | 'click_pro_started';
    /** 当前页面 */
    source:
      | 'landing'
      | 'search'
      | 'bots_detailpage'
      | 'template_detailpage'
      | 'user_profile'
      | 'developer'
      | 'evaluate'
      | 'cases';
    /** 上一级页面 */
    from?: string;
  };
  [EVENT_NAMES.bot_deployment_details]: CozeDevPublishCommonParams;
  [EVENT_NAMES.bot_pre_release_ppe]: CozeDevPublishCommonParams;
  [EVENT_NAMES.bot_ppe_version_select]: CozeDevPublishCommonParams;
  [EVENT_NAMES.bot_ppe_release_event]: CozeDevPublishCommonParams & {
    ppe_lane: string;
    error_message?: string;
    is_incompatible: boolean;
  };
  [EVENT_NAMES.bot_history_show]: CozeDevPublishCommonParams & {
    from: 0 | 1;
    channel: 0 | 1 | 2;
  };
  [EVENT_NAMES.bot_ppe_offline]: CozeDevPublishCommonParams & {
    ppe_lane: string;
    error_message?: string;
  };
  [EVENT_NAMES.store_search_page_front]: {
    result_type: string;
    entity_id?: string;
    entity_name?: string;
    show_official_plugin?: boolean;
    category_id?: string;
    category_name?: string;

    search_word?: string;
    model?: string;
    agent_mode?: string;
    public_mode?: string;
    publishing_platform?: string;
    resouces_used?: string;
    action?: string;
    access_entrance?: string;
  };
  [EVENT_NAMES.store_search_front]: {
    result_type?: string;
    entity_id?: string;
    entity_name?: string;
    action: string;
    search_word: string;
  };
  [EVENT_NAMES.content_show_front]: {
    content_id: string;
    content_type: 'post' | 'comment';
    author_type: 'owner' | 'bot' | 'regular';
    author_id: string;
    product_id: string;
    product_name: string;
    source: 'fourm_list' | 'content_detailpage';
    from: 'fourm_list';
  };
  [EVENT_NAMES.content_click_front]: {
    content_id: string;
    content_type: 'post' | 'comment';
    author_type: 'owner' | 'bot' | 'regular';
    author_id: string;
    product_id: string;
    product_name: string;
    source: 'fourm_list' | 'content_detailpage';
    from: 'fourm_list';
    action?:
      | 'enter_detailpage'
      | 'reply'
      | 'emoji_react'
      | 'expand_content'
      | 'expand_reply';
  };
  [EVENT_NAMES.analysis_indicator_auto_refresh_interval]: {
    tab: 'overview' | 'performance';
    space_id: string;
    bot_id: string;
    interval: string;
  };
  [EVENT_NAMES.analysis_indicator_interval]: {
    tab: 'overview' | 'performance';
    space_id: string;
    bot_id: string;
    interval: string;
  };
  [EVENT_NAMES.share_topic]: {
    topic_id: string;
  };

  [EVENT_NAMES.landing_topic]: {
    topic_id: string;
  };
  [EVENT_NAMES.collect_topic]: {
    topic_id: string;
    is_collect: '0' | '1';
  };
  [EVENT_NAMES.view_all]: {
    topic_id: string;
  };
  [EVENT_NAMES.click_topic]: {
    topic_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.dev_bot_share_screenshot_front]: {
    bot_id: string;
    stage: 'client' | 'server' | 'full';
    stage_time: number; // 阶段耗时，单位毫秒
    stage_status: boolean; // 阶段状态
    stage_extra?: string; // 额外内容，stage=full时会使用该字段记录哪个阶段为最终结果
  };
  [EVENT_NAMES.language_switch_show]: {
    country_code: string;
  };
  [EVENT_NAMES.language_switch_click]: {
    country_code: string;
  };
  // 模型竞技场
  [EVENT_NAMES.arena_bot_show_front]: {
    product_id: string;
    product_name: string;
    c_position: string;
    filter_tag: string;
    source: 'arena_startpage' | 'arena_selectbot';
  };
  [EVENT_NAMES.arena_bot_click_front]: {
    product_id: string;
    product_name: string;
    c_position: string;
    filter_tag: string;
    source: 'arena_startpage' | 'arena_selectbot';
  };
  [EVENT_NAMES.arena_bot_front]: {
    bot_id?: string;
    product_id: string;
    production_name: string;
    c_position: string;
    filter_tag: string;
    source: 'arena_startpage' | 'arena_selectbot';
  };
  [EVENT_NAMES.arena_click_front]: {
    pk_id: string;
    from:
      | 'arena_startpage'
      | 'arena_selectbot'
      | 'arena_pkpage | arena_leaderboard';
    action: 'start_pk' | 'send_message' | 'vote' | 'quit';
    start_type: 'choose_bot' | 'random_bot' | 'model';
    is_question_bank?: '0' | '1';
    question_id?: string;
    bank_id?: string;
  };
  [EVENT_NAMES.question_bank_click_front]: {
    action: 'select_bank' | 'close_bank';
    bank_id: string;
  };
  [EVENT_NAMES.query_analytics_select_channel]: {
    space_id: string;
    bot_id: string;
    channel?: string;
  };
  [EVENT_NAMES.memory_click_front]: {
    bot_id?: string;
    project_id?: string;
    product_id?: string;
    resource_name?: string;
    resource_id?: string;
    resource_type?: 'variable' | 'database' | 'long_term_memory' | 'filebox';
    action: 'turn_on' | 'turn_off' | 'add' | 'delete' | 'edit' | 'reset';
    source:
      | 'bot_detail_page'
      | 'store_detail_page'
      | 'app_detail_page'
      | 'library_workflow_detail_page';
    source_detail: 'memory_manage' | 'memory_preview';
  };
  [EVENT_NAMES.query_analytics_intent_jump_queries]: {
    space_id: string;
    bot_id: string;
    channel?: string;
    host?: string;
  };

  // 个人主页
  [EVENT_NAMES.profile_entrance]: {
    /**
     * my_profile：点击「我的主页」进入我的主页
      share_my_link：点击我自己主页的分享链接后，也可以进入我的主页进入他人主页的入口：
      bot_detail：商店 bot 详情页
      plugin_detail：商店插件详情页
      workflow_detail：商店工作流详情页
      bot_community：bot 详情页讨论区
      my_profile_Interactive_panel：我的主页的互动面板（关注、粉丝）
      my_profile_visit_history：我的主页的访问历史
      share_others_link：通过分享链接进入了他人的主页"
     */
    access_entrance:
      | 'my_profile'
      | 'share_my_link'
      | 'bot_detail'
      | 'plugin_detail'
      | 'workflow_detail'
      | 'bot_community'
      | 'my_profile_Interactive_panel'
      | 'my_profile_visit_history'
      | 'share_others_link'
      | string;
    url_source: string;
    access_status: 'me' | 'others';
    user_id: string;
    visited_uid: string;
  };
  [EVENT_NAMES.profile_follow]: {
    user_id: string;
    followed_uid: string;
    follow_access:
      | 'others_profile'
      | 'bot_detail'
      | 'project_detail'
      | 'plugin_detail'
      | 'workflow_detail'
      | 'my_profile_Interactive_panel'
      | 'my_profile_visit_history'
      | 'homepage';
  };
  [EVENT_NAMES.profile_share]: {
    user_id: string;
    shared_uid: string;
    share_type: 'me' | 'others';
    url_source: string;
  };
  [EVENT_NAMES.agent_app_home_view]: {
    app_id: string;
  };
  [EVENT_NAMES.agent_app_instance_click]: {
    app_id: string;
    instance_id: string;
  };
  [EVENT_NAMES.agent_app_detail_view]: {
    app_id: string;
    instance_id: string;
  };
  [EVENT_NAMES.agent_app_instance_create]: {
    app_id: string;
  };
  [EVENT_NAMES.agent_app_send_message]: {
    app_id: string;
    bot_id: string;
    bot_version: string;
  };
  [EVENT_NAMES.agent_app_shortcut_command]: {
    app_id: string;
    bot_id: string;
    bot_version: string;
  };
  [EVENT_NAMES.analytics_tab_view]: {
    space_id: string;
    bot_id: string;
    tab_name: string;
    host: string;
    refer?: string;
  };
  [EVENT_NAMES.analytics_tab_view_duration]: {
    space_id: string;
    bot_id: string;
    tab_name: string;
    host: string;
    duration: number;
  };
  [EVENT_NAMES.bot_gray_publish]: {
    space_id: string;
    bot_id: string;
    host: string;
    type: 'create' | 'edit';
  };
  [EVENT_NAMES.click_debug_panel_feedback_button]: {
    space_id: string;
    bot_id: string;
    host: string;
  };

  [EVENT_NAMES.flow_store_list_click]: {
    store_type: FlowStoreType;
    category_name: string;
    rank_type: string;
  };

  [EVENT_NAMES.flow_store_detail_click]: {
    action: 'testrun';
    store_type: FlowStoreType;
  };

  // 流程商店事件 
  [EVENT_NAMES.flow_creation_click]: {
    action: string;
    store_type: string;
  };
  [EVENT_NAMES.flow_duplicate_click]: {
    store_type: FlowStoreType;
    resource: FlowResourceFrom;
    category_name: string;
    duplicate_type: FlowDuplicateType;
  };
  [EVENT_NAMES.eval_panel_show]: {
    bot_id: string;
    space_id: string;
    from: number;
    user_type?: number;
    host: string;
  };
  [EVENT_NAMES.eval_task_operation]: {
    bot_id: string;
    space_id: string;
    from: number;
    user_type?: number;
    task?: number;
    status: number;
    host: string;
  };
  [EVENT_NAMES.eval_panel_tab_show]: {
    bot_id: string;
    space_id: string;
    tab_id: number;
    host: string;
  };
  [EVENT_NAMES.eval_result_show]: {
    bot_id: string;
    space_id: string;
    from: number;
    status: number;
    host: string;
  };
  [EVENT_NAMES.eval_result_tab_show]: {
    bot_id: string;
    space_id: string;
    tab_id: number;
    host: string;
  };
  [EVENT_NAMES.eval_result_detail_sort]: {
    bot_id: string;
    space_id: string;
    sift: number;
    host: string;
  };
  [EVENT_NAMES.preview_link_click]: {
    bot_id: string;
    space_id: string;
    host: string;
    content_type: string;
  };
  [EVENT_NAMES.prompt_optimize_front]:
    | {
        type: 'auto' | 'require' | 'debug' | 'replace' | 'insert';
        reply_id: string;
        action:
          | 'send'
          | 'stop_response'
          | 'adopt'
          | 'copy'
          | 'regenerate'
          | 'like'
          | 'dislike';
      }
    | {
        action: 'exit';
      };
  [EVENT_NAMES.tutorial_item_ck]: {
    item_id: string;
  };
  [EVENT_NAMES.tutorial_tips_pv]: {
    type_id: string;
  };
  // 参数含义见：
  [EVENT_NAMES.home_action_front]: {
    home_type: 'banner' | 'quick_start' | 'recommends' | 'Following';
    item: string;
    item_type?:
      | 'agent'
      | 'plugin_template'
      | 'workflow_template'
      | 'image_flow_template'
      | 'project_product'
      | 'personal_info'
      | 'operation_notification';
    action: 'view' | 'click';
    product_id?: string;
    message_id?: string;
  };
  [EVENT_NAMES.workspace_action_front]: {
    space_id: string;
    space_type: 'personal' | 'teamspace';
    tab_name: 'develop' | 'library' | 'team_settings';
  } & (
    | {
        action: 'filter';
        filter_type?: 'types' | 'creators' | 'status';
        filter_name?: string;
      }
    | {
        action: 'click';
        id?: string;
        name?: string;
        type?:
          | 'agent'
          | 'plugin'
          | 'workflow'
          | 'imageflow'
          | 'knowledge'
          | 'prompt'
          | 'ui'
          | 'database'
          | 'variable'
          | 'voice';
      }
  );
  /** 字段含义见  */
  [EVENT_NAMES.template_action_front]: {
    template_id: string;
    template_name: string;
    entity_id: string;
    /** project 模板会有个 project 副本 id */
    entity_copy_id?: string;
    template_tag_prize: 'free' | 'paid';
    template_type: 'workflow' | 'imageflow' | 'bot' | 'project' | 'unknown';
    template_tag_professional: 'professional' | 'basic';
    action:
      | 'run'
      | 'click'
      | 'duplicate'
      | 'purchase'
      | 'edit'
      | 'public'
      | 'use'
      | 'page_view'
      | 'card_view'
      | 'share'
      | 'buy_agreement_checked'
      | 'buy_agreement_unchecked';
    after_id?: string;
    after_name?: string;
    /** 当前页面 */
    source?:
      | 'landing'
      | 'search'
      | 'templatelist'
      | 'template_detailpage'
      | 'personal'
      | 'space'
      | 'navi';
    from?: string;
  } & (
    | {
        template_tag_prize: 'free';
      }
    | {
        template_tag_prize: 'paid';
        template_prize_detail: number;
      }
  );
  [EVENT_NAMES.search_front]: {
    full_url: string;
    source: 'develop' | 'library';
    search_word?: string;
  };
  [EVENT_NAMES.coze_agent_front]: {
    action: 'view' | 'click' | 'chat' | 'hide';
  };
  [EVENT_NAMES.notification_front]: {
    message_id?: string;
    notify_content?: string;
    action: 'red_dot' | 'view' | 'link_click';
    content_url?: string;
  };
  [EVENT_NAMES.notification_center_click_front]: {
    action: 'all' | 'unread' | 'clear';
  };
  [EVENT_NAMES.coze_pro_popup_front]: {
    action: 'view' | 'click';
    button_name?: 'pro_login' | 'basic_copy' | 'volcano';
    second_environment?: 'cn-coze-pro' | 'cn-coze-basic';
  };
  [EVENT_NAMES.coze_landing_front]: {
    button_name?: 'pro_login' | 'basic_login';
  };
  [EVENT_NAMES.oauth_page_stay_time_front]: {
    stay_time: string;
  };
  [EVENT_NAMES.oauth_page_click_front]: {
    action: 'confirm' | 'policy';
  };
  [EVENT_NAMES.account_upgrade_page_click_front]: {
    action: 'got it';
  };
  [EVENT_NAMES.query_new_trace_csv_export]: {
    bot_id: string;
    space_id: string;
  };
  [EVENT_NAMES.query_new_trace_columns_update]: {
    selectedTag: string;
  };
  [EVENT_NAMES.query_new_trace_list_view]: {
    space_id: string;
    bot_id: string;
    trace_id?: string;
  };
  [EVENT_NAMES.query_new_trace_row_click]: {
    space_id: string;
    bot_id: string;
    trace_id?: string;
  };
  [EVENT_NAMES.query_new_trace_detail_view]: {
    space_id: string;
    bot_id: string;
    trace_id?: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_status_update]: {
    status: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_message_ids_update]: {
    ids: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_user_ids_update]: {
    ids: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_session_ids_update]: {
    ids: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_input_update]: {
    text: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_output_update]: {
    text: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_intent_update]: {
    intent: string;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_input_tokens_update]: {
    gte: number;
    lte: number;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_output_tokens_update]: {
    gte: number;
    lte: number;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_latency_update]: {
    gte: number;
    lte: number;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_latency_first_resp_update]: {
    gte: number;
    lte: number;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.query_new_trace_quick_filter_time_update]: {
    gte: number;
    lte: number;
    space_id: string;
    bot_id: string;
  };
  [EVENT_NAMES.add_member_pop_up_show]: TeamInviteParams;
  [EVENT_NAMES.playground_click_front]: PlaygroundClickCommonParams;
  [EVENT_NAMES.playground_set_front]: PlaygroundSettingParams;
  [EVENT_NAMES.playground_authorize_front]: PlaygroundAuthorizeParams;
  [EVENT_NAMES.doc_click_front]: DocClickCommonParams;
  [EVENT_NAMES.docs_page_view_front]: {
    docs_type: string;
    docs_title: string;
    docs_path: string;
    keywords?: string;
  };

  [EVENT_NAMES.publish_oauth_button_click]: {
    action: string;
    channel_name: string;
  };
  [EVENT_NAMES.settings_oauth_button_click]: {
    action: string;
    channel_name: string;
  };
  [EVENT_NAMES.coze_pro_popup_plan_buy_token]: {
    action: string;
  };
  [EVENT_NAMES.prompt_library_front]: {
    source: string;
    prompt_id: string;
    space_id: string;
    project_id?: string;
    bot_id?: string;
    workflow_id?: string;
    prompt_type: string;
    action: string;
  };
  [EVENT_NAMES.compare_mode_front]: {
    compare_type: 'models' | 'prompts';
    from?: 'prompt_resource' | 'compare_button' | 'restore';
    source: string;
    action: 'start' | 'send_message' | 'select' | 'finish' | 'discard';
    space_id?: string;
    bot_id?: string;
    project_id?: string;
    workflow_id?: string;
  };
  [EVENT_NAMES.site_change_click]: SiteChangeClickParams;
}

export enum FlowStoreType {
  workflow = '1',
  imageflow = '2',
}

export enum FlowResourceFrom {
  storeDetail = '1',
  flowIde = '2',
  botIde = '3',
  template = '4',
}
export enum FlowDuplicateType {
  toBot = '1',
  toWorkspace = '2',
}
