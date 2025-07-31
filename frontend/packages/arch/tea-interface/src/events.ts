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
// TODO view_bot & view_database for further consideration

export {
  ProductEventSource,
  ProductEventFilterTag,
  ProductEventEntityType,
  ProductShowFrontParams,
} from './product';

export enum EVENT_NAMES {
  sign_up_front = 'sign_up_front', // Register login event
  page_from = 'page_from', // Report to referer
  page_view = 'page_view', // Browse, My Bot
  view_bot = 'view_bot', // Browse, My Bot
  view_database = 'view_database', // Browsing, Knowledge Base Management
  click_create_bot_confirm = 'click_create_bot_confirm', // Click to create Bot
  click_prompt_edit = 'click_prompt_edit', // Click, persona, and reply logic editor
  click_tool_select = 'click_tool_select', // Click to adjust the Bot tool call
  click_database_select = 'click_database_select', // Click to adjust the Bot Knowledge Base call
  click_welcome_message_edit = 'click_welcome_message_edit', // Click to adjust the opening line
  click_send_message = 'click_send_message', // Click to send a debug message
  delete_rec_plugin = 'delete_rec_plugin', // Delete AI-generated plugins
  submit_rec_plugin = 'submit_rec_plugin', // Release AI-generated plugins
  bot_show = 'bot_show', //  Bot card exposure
  bot_click = 'bot_click', //  Click on the bot card
  click_bot_duplicate = 'click_bot_duplicate', //TODO explore bot Click to copy the old event tracking Keep it first, switch to bot_duplicate_click_front and then go offline.
  bot_duplicate_click_front = 'bot_duplicate_click_front', // Bot click copy and switch to event tracking uniformly.
  coze_space_sidenavi_ck = 'coze_space_sidenavi_ck', // Menu bar Click on public event tracking
  coze_enterprise_sidenavi_ck = 'coze_enterprise_sidenavi_ck', // Menu bar Click on public event tracking
  // Binding variable related event tracking
  binding_card_list = 'binding_card_list',
  binding_card_add = 'binding_card_add',
  binding_card_update = 'binding_card_update',
  binding_card_preview = 'binding_card_preview',
  // #region suggestion related
  edited_suggestion = 'edited_suggestion',
  // #endregion
  // Card editor event tracking
  builder_editor_view = 'builder_editor_view',
  builder_plugin_info = 'builder_plugin_info',
  builder_plugin_channel = 'builder_plugin_channel',
  builder_plugin_var = 'builder_plugin_var',
  builder_plugin_structure = 'builder_plugin_structure',
  builder_plugin_component = 'builder_plugin_component',
  builder_plugin_canvas = 'builder_plugin_canvas',
  builder_plugin_set = 'builder_plugin_set', // properties panel
  builder_plugin_preview = 'builder_plugin_preview',
  builder_plugin_publish = 'builder_plugin_publish',
  // ui_builder event tracking
  ui_builder_exposure = 'ui_builder_exposure',
  ui_builder_initialization = 'ui_builder_initialization',
  ui_builder_component_usage = 'ui_builder_component_usage',
  ui_builder_setter_usage = 'ui_builder_setter_usage',
  // Template event tracking
  builder_plugin_template = 'builder_plugin_template',
  // Ai event tracking
  builder_plugin_copilot_enter_click = 'builder_plugin_copilot_enter_click',
  builder_plugin_copilot_gen_click = 'builder_plugin_copilot_gen_click',
  builder_editor_show = 'builder_editor_show',
  card_webruntime_view = 'card_webruntime_view',
  card_webruntime_render = 'card_webruntime_render',
  card_webruntime_error = 'card_webruntime_error',
  BuilderPluginStructure = 'BuilderPluginStructure',
  BuilderPluginCanvas = 'BuilderPluginCanvas',
  card_builder_show = 'card_builder_show',
  select_scheduled_tasks_timezone = 'select_scheduled_tasks_timezone', // Select the default timed task time zone
  log_not_supported_timezone = 'log_not_supported_timezone', // Time zone identifiers not supported by the current environment
  cookie_click = 'cookie_click',
  cookie_show = 'cookie_show',
  // Agent App event tracking
  agent_app_home_view = 'agent_app_home_view',
  agent_app_instance_click = 'agent_app_instance_click',
  agent_app_instance_create = 'agent_app_instance_create',
  agent_app_detail_view = 'agent_app_detail_view',
  agent_app_shortcut_command = 'agent_app_shortcut_command',
  agent_app_send_message = 'agent_app_send_message',
  // User video tutorial event tracking
  tutorial_enter_ck = 'tutorial_enter_ck',
  tutorial_list_pv = 'tutorial_list_pv',
  tutorial_item_ck = 'tutorial_item_ck',
  tutorial_tips_pv = 'tutorial_tips_pv',

  // coze home
  home_page_view = 'home_page_view',
  // Global sidebar navigation event tracking
  tab_click = 'tab_click', // Click on a first-level menu item
  workspace_tab_expose = 'workspace_tab_expose', // Exposure of Plates in Workspace

  // #region team space key
  create_workspace_click = 'create_workspace_click', // Click to create Workspace
  create_workspace_result = 'create_workspace_result', // The result of creating a workspace
  /** Disable child users from creating space switch clicks */
  enterprise_switch_child_create_space_click = 'enterprise_switch_child_create_space_click',
  /** Prohibit adding non-sub-users to enter the space switch and click */
  enterprise_switch_add_outside_user_click = 'enterprise_switch_add_outside_user_click',
  /** Disable joining external space switch click */
  enterprise_switch_join_outside_space_click = 'enterprise_switch_join_outside_space_click',
  /** Space switch panel display */
  space_switch_show = 'space_switch_show',
  /** Click on the space switch panel */
  space_switch_click = 'space_switch_click',
  /** Members and Settings button click */
  space_admins_button_click = 'space_admins_button_click',
  /** Member management page display */
  space_members_page_show = 'space_members_page_show',
  /** Member Management Page Click */
  space_members_page_click = 'space_members_page_click',
  /** Remove member secondary pop-up display */
  space_member_remove_pop_show = 'space_member_remove_pop_show',
  /** Remove member secondary pop-up click */
  space_member_remove_pop_click = 'space_member_remove_pop_click',
  /** Invitation management page display */
  space_invitation_page_show = 'space_invitation_page_show',
  /** Click on the invitation management page */
  space_invitation_page_click = 'space_invitation_page_click',
  /** Cancel the invitation secondary pop-up window display */
  space_invitation_revoke_pop_show = 'space_invitation_revoke_pop_show',
  /** Cancel the invitation and click on the secondary pop-up window. */
  space_invitation_revoke_pop_click = 'space_invitation_revoke_pop_click',

  /** Team settings page display */
  space_settings_page_show = 'space_settings_page_show',
  /** Click on the team settings page */
  space_settings_page_click = 'space_settings_page_click',
  /** Member Team Settings button click */
  space_settings_button_click = 'space_settings_button_click',
  /** Share link pop-up display */
  space_share_link_popup_show = 'space_share_link_popup_show',
  /** Share link pop-up click */
  space_share_link_popup_click = 'space_share_link_popup_click',
  /** Add member pop-up display */
  space_add_members_popup_show = 'space_add_members_popup_show',
  /** Add member pop-up click */
  space_add_members_popup_click = 'space_add_members_popup_click',
  /** Leave the team pop-up display */
  space_settings_secondary_pop_show = 'space_settings_secondary_pop_show',
  space_settings_secondary_pop_click = 'space_settings_secondary_pop_click',
  // #endregion

  create_bot_click = 'create_bot_click', // Click to create Bot
  create_bot_result = 'create_bot_result', // The result of creating a Bot
  bot_duplicate_click = 'bot_duplicate_click', // Bot clicks copied
  bot_duplicate_result = 'bot_duplicate_result', // Bot copy result
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
  //product exposure
  product_show = 'product_show',
  product_click = 'product_click',
  //Bot product exposure
  product_show_front = 'product_show_front',
  product_click_front = 'product_click_front',
  click_open_in_front = 'click_open_in_front',
  favorite_click_front = 'favorite_click_front',

  // product operation event
  product_run_front = 'product_run_front',

  // Material store shelves
  entity_publish_click_front = 'entity_publish_click_front',

  // bot details
  share_front = 'share_front',
  bot_detail_page_front = 'bot_detail_page_front',
  share_recall_page_front = 'share_recall_page_front', // share stream

  // Bot event tracking
  dev_bot_share_screenshot_front = 'dev_bot_share_screenshot_front', // Bot share screenshots

  // TTS
  bot_tts_configure = 'bot_tts_configure', // TTS switch configuration
  bot_tts_select_click = 'bot_tts_select_click', // Select the tone button with a click
  bot_tts_select_confirm = 'bot_tts_select_confirm', // Select the tone confirmation button with a click

  // voice call
  voice_chat_call = 'voice_chat_call',
  voice_chat_opening_dialog = 'voice_chat_opening_dialog',
  voice_chat_connect = 'voice_chat_connect',
  voice_chat_record = 'voice_chat_record',
  voice_chat_think = 'voice_chat_think',
  voice_chat_speak = 'voice_chat_speak',
  voice_chat_hang_up = 'voice_chat_hang_up',
  voice_chat_error = 'voice_chat_error',

  // Token incentive
  task_click = 'task_click', // Task button click
  task_show = 'task_show', // mission presentation
  buy_token_click = 'coze_token_buy_click', // Click the Buy token button
  choose_amount_click = 'coze_token_buy_amount_click', // Select token purchase quota
  confirm_checkout_click = 'coze_token_buy_confirm_click', // Confirm the initiation of payment

  token_insufficiency_pop_up = 'token_insufficiency_pop_up', // Insufficient coze tokens
  // Publish event tracking
  click_auto_gen_changelog_button = 'click_auto_gen_changelog_button',
  click_stop_auto_gen_changelog_button = 'click_stop_auto_gen_changelog_button',
  auto_gen_changelog_finish = 'auto_gen_changelog_finish',
  bot_publish = 'bot_publish',
  bot_publish_button_click = 'bot_publish_button_click', // Publish button click
  bot_publish_audit_pop_up = 'bot_publish_audit_pop_up', // Publish moderation to block pop-ups

  // Operation banner
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

  // Mockset event tracking
  create_mockset_front = 'create_mockset_front',
  del_mockset_front = 'del_mockset_front',
  create_mock_front = 'create_mock_front',
  del_mock_front = 'del_mock_front',
  use_mockset_front = 'use_mockset_front',
  use_mockgen_front = 'use_mockgen_front',

  // Plugin Privacy Statement
  privacy_plugin_popup_front = 'privacy_plugin_popup_front',
  privacy_plugin_form_front = 'privacy_plugin_form_front',
  privacy_plugin_form_server = 'privacy_plugin_form_server',
  privacy_store_privacy_front = 'privacy_store_privacy_front',
  // boot pop-up
  bot_desc_dialog_front = 'bot_desc_dialog_front',
  // Plugin/tool import export
  create_plugin_front = 'create_plugin_front',
  create_plugin_tool_front = 'create_plugin_tool_front',
  code_snippet_front = 'code_snippet_front',

  // Workflow optimization requirements [PRD] ()
  /** Node debugging alone */
  workflow_test_node = 'workflow_test_node',
  /** Created test set successfully */
  workflow_create_testset = 'workflow_create_testset',
  /** AI generated imported parameters */
  workflow_aigc_params = 'workflow_aigc_params',
  /** Data sources during TestRun */
  workflow_testrun_source = 'workflow_testrun_source',
  /**
   * Workflow Testrun Results
   *
   */
  workflow_testrun_result_front = 'workflow_testrun_result_front',
  /**
   * ! workflow Testrun node details, currently defined only, no event tracking
   *
   */
  workflow_testrun_detailed_front = 'workflow_testrun_detailed_front',
  /** Pre-release button click */
  workflow_pre_release_ppe = 'workflow_pre_release_ppe',
  /** PPE release version selection */
  workflow_ppe_version_select = 'workflow_ppe_version_select',
  /** Publish ppe environment */
  workflow_ppe_release_event = 'workflow_ppe_release_event',
  /** Historical version display */
  workflow_history_show = 'workflow_history_show',
  /** environment removal */
  workflow_ppe_offline = 'workflow_ppe_offline',
  /* Click _workflow version to submit */
  workflow_submit = 'workflow_submit',
  /* Click _ to view workflow submit difference */
  workflow_submit_difference = 'workflow_submit_difference',
  /* Click _ view workflow publish difference */
  workflow_publish_difference = 'workflow_publish_difference',
  /* Browse _workflow merge */
  workflow_merge_page = 'workflow_merge_page',
  /* Click _ merge */
  workflow_merge = 'workflow_merge',
  /* Browse the list of _workflow submissions */
  workflow_submit_version_history = 'workflow_submit_version_history',
  /* Click _ restore workflow commit version */
  workflow_submit_version_revert = 'workflow_submit_version_revert',
  /* Click _ to view the workflow submission version */
  workflow_submit_version_view = 'workflow_submit_version_view',
  /* Click on the workflow collaboration switch */
  workflow_cooperation_switch_click = 'workflow_cooperation_switch_click',
  /* Help Documentation */
  workflow_test_run_click = 'workflow_test_run_click',

  // Widget event tracking
  widget_create_click = 'widget_create_click',
  widget_duplicate_click = 'widget_duplicate_click',
  widget_delete_click = 'widget_delete_click',

  // devops -> query-trace
  analytics_tab_view = 'analytics_tab_view',
  analytics_tab_view_duration = 'analytics_tab_view_duration',
  // list page
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

  // details page
  query_trace_graph_tab_click = 'query_trace_graph_tab_click',
  query_trace_tree_node_click = 'query_trace_tree_node_click',
  query_trace_flamethread_node_click = 'query_trace_flamethread_node_click',
  query_trace_input_copy = 'query_trace_input_copy',
  query_trace_output_copy = 'query_trace_output_copy',
  // age gate
  age_gate_show = 'age_gate_show',
  age_gate_click = 'age_gate_click',
  // debugging bench
  open_debug_panel = 'open_debug_panel',
  debug_page_show = 'debug_page_show',

  // Intelligent Analytics Assistant
  ai_analysis_assistant_entry_click = 'ai_analysis_assistant_entry_click',
  ai_analysis_assistant_send_click = 'ai_analysis_assistant_send_click',
  // devops -> performance
  performance_view = 'performance_view',
  // Devops - query analysis
  query_analytics_select_channel = 'query_analytics_select_channel',
  query_analytics_intent_jump_queries = 'query_analytics_intent_jump_queries',
  // DevOps - Operational Metrics
  analysis_indicator_interval = 'analysis_indicator_interval',
  analysis_indicator_auto_refresh_interval = 'analysis_indicator_auto_refresh_interval',

  // review
  create_dataset = 'create_dataset',
  create_rule = 'create_rule',
  add_rule_type = 'add_rule_type',
  create_case = 'create_case',
  case_result = 'case_result',

  get_start = 'get_start',

  // Coze-dev bot multi-version online
  bot_deployment_details = 'bot_deployment_details',
  bot_pre_release_ppe = 'bot_pre_release_ppe',
  bot_ppe_version_select = 'bot_ppe_version_select',
  bot_ppe_release_event = 'bot_ppe_release_event',
  bot_history_show = 'bot_history_show',
  bot_ppe_offline = 'bot_ppe_offline',
  bot_gray_publish = 'bot_gray_publish',

  // Search
  store_search_page_front = 'store_search_page_front',
  store_search_front = 'store_search_front',

  // Product discussion forum
  content_show_front = 'content_show_front',
  content_click_front = 'content_click_front',

  // personal homepage
  profile_entrance = 'profile_entrance',
  profile_share = 'profile_share',
  profile_follow = 'profile_follow',

  //special topic
  share_topic = 'share_topic',
  landing_topic = 'landing_topic',
  collect_topic = 'collect_topic',
  view_all = 'view_all',
  click_topic = 'click_topic',

  //Switch language
  language_switch_show = 'language_switch_show',
  language_switch_click = 'language_switch_click',
  // Bot Arena
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

  // Process Store
  flow_creation_click = 'flow_creation_click',
  flow_duplicate_click = 'flow_duplicate_click',
  // review
  eval_panel_show = 'coze_panel_show',
  eval_task_operation = 'eval_task_operation',
  eval_panel_tab_show = 'eval_panel_tab_show',
  eval_result_show = 'eval_result_show',
  eval_result_tab_show = 'eval_result_tab_show',
  eval_result_detail_sort = 'eval_result_detail_sort',
  // Quick Instruction
  shortcut_use = 'shortcut_use',
  // multimodal preview
  preview_link_click = 'preview_link_click',
  // nl2prompt
  prompt_optimize_front = 'prompt_optimize_front',
  // home 2.0
  home_action_front = 'home_action_front',
  template_action_front = 'template_action_front',
  // coze assistant
  coze_agent_front = 'coze_agent_front',
  // Home Notifications Related event tracking
  notification_front = 'notification_front',
  notification_center_show_front = 'notification_center_show_front',
  notification_center_click_front = 'notification_center_click_front',
  // Pro related event tracking
  coze_pro_popup_front = 'coze_pro_popup_front', // Professional version rights pop-up window
  coze_landing_front = 'coze_landing_front', // Coze homepage Click the login button

  add_member_pop_up_show = 'add_member_pop_up_show_front',
  oauth_page_stay_time_front = 'oauth_page_stay_time_front', //	OAuth authorization page dwell time
  oauth_page_show_front = 'oauth_page_show_front', //	OAuth authorization page display
  oauth_page_click_front = 'oauth_page_click_front', // Click on the OAuth authorization page.
  account_upgrade_page_show_front = 'account_upgrade_page_show_front', //	The upgrade was successful pop-up display
  account_upgrade_page_click_front = 'account_upgrade_page_click_front', // Click on the pop-up window of successful upgrade.

  coze_pro_popup_plan_buy_token = 'coze_pro_popup_plan_buy_token', // Purchase resource points

  // Playground event tracking
  playground_click_front = 'playground_click_front', // click event
  playground_set_front = 'playground_set_front', // configuration behavior reporting
  playground_authorize_front = 'playground_authorize_front', // Authorization behavior report
  // coze-doc event tracking
  doc_click_front = 'doc_click_front', // click event
  docs_page_view_front = 'docs_page_view_front', // Document page view

  // Channel OAuth authorization event tracking
  publish_oauth_button_click = 'publish_oauth_button_click',
  settings_oauth_page_show = 'settings_oauth_page_show',
  settings_oauth_button_click = 'settings_oauth_button_click',

  // Cue related event tracking
  prompt_library_front = 'prompt_library_front', // Tip word resource related front-end event tracking

  // Compare related event tracking
  compare_mode_front = 'compare_mode_front', // Compare related front-end event tracking

  // universal site toggle click
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

// Explore bot card common event tracking parameters
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
/** Int64 type is actually string | number */
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

// Event Tracking
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
  Click = 1, // Click to list
  Confirm = 2, // Confirm listing
  Remove = 3, // Confirm to remove from the shelves
  Resume = 4, // Back on the shelves
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
  Show = 1, // pop-up display
  Cancel = 2, // cancel
  Confirm = 3, // OK
  Close = 4, // close
}

export enum PluginMockDataGenerateMode {
  MANUAL = 0, // create manually
  RANDOM = 1, // random generation
  LLM = 2, // large model generation
}

export enum BotShareConversationClick {
  CopyLink = 1,
  CopyImage = 2,
  DownloadImage = 3,
}

/**
 * UG thread return parameter
 *
 */
export interface UserGrowthEventParams {
  /**
   * The full URL when the user's visit was actually received.
   */
  LandingPageUrl: string;
  /**
   * AppId agreed with UG
   */
  AppId: number;
  /**
   * EventName agreed with UG
   */
  EventName: string;
  /**
   * Secondtimestamp Math.floor (Date.now ()/1000)
   */
  EventTs: number;
  /**
   * Fixed value '4'
   */
  growth_deepevent: '4';
}

export interface ParamsTypeDefine {
  [EVENT_NAMES.page_from]: {
    url: string;
    page_from: string;
  };
  [EVENT_NAMES.page_view]: {
    need_login: boolean; // Is a login required to access the current URL?
    have_access: boolean; // Is it in the waitlist?
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

  // #region team space, parameters
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

  //Product bot
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
    /** Where did you log in from? */
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
     * operation type
     * - testrun_start: trigger
     * - testrun_end: over
     * - manual_end: user canceled
     */
    action: 'testrun_start' | 'testrun_end' | 'manual_end';
    results?: 'success' | 'fail';
    /**
     * Intercept end
     * - front_end: Front end interception
     * - server_end: backend interception
     */
    fail_end?: 'front_end' | 'server_end';
    /**
     * Type of failure:
     * - flow_validate: Process validation failed
     * - trigger_error: Failed to trigger TestRun
     * - save_flow_error: Process save failed
     * - run_error: Error
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
     * Intercept end
     * - front_end: Front end interception
     * - server_end: backend interception
     */
    fail_end?: 'front_end' | 'server_end';
    /** failure type */
    nodes_errortype?: string;
    /** failure details */
    nodes_errdetail?: string;
  };
  [EVENT_NAMES.workflow_pre_release_ppe]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * Type of entry:
     * - 0: Publish button drop down
     * - 1: History drawer bottom button
     * - 2: History Cards drop-down menu
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
     * Status:
     * - 0: success
     * - 1: Fail
     */
    status: number;
    ppe_lane: string;
    error_message?: string;
  };
  [EVENT_NAMES.workflow_history_show]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * View the entry to the historical version:
     * - 0: workflowIDE entrance
     * - 1: workflowIDE PPE release page entry
     */
    from: number;
    /**
     * View the type of historical version
     */
    channel: OperateType;
  };
  [EVENT_NAMES.workflow_ppe_offline]: {
    workspace_id: string;
    workflow_id: string;
    /**
     * Status:
     * - 0: success
     * - 1: Fail
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
    is_login: boolean; // Is a login required to access the current URL?
    action: 'click_get_started' | 'click_pro_started';
    /** current page */
    source:
      | 'landing'
      | 'search'
      | 'bots_detailpage'
      | 'template_detailpage'
      | 'user_profile'
      | 'developer'
      | 'evaluate'
      | 'cases';
    /** previous page */
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
    stage_time: number; // Phase time, in milliseconds
    stage_status: boolean; // phase state
    stage_extra?: string; // Extra content, stage = full will use this field to record which stage is the final result
  };
  [EVENT_NAMES.language_switch_show]: {
    country_code: string;
  };
  [EVENT_NAMES.language_switch_click]: {
    country_code: string;
  };
  // Model Arena
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

  // personal homepage
  [EVENT_NAMES.profile_entrance]: {
    /**
     * my_profile: Click "My Homepage" to enter my homepage
      share_my_link: After clicking on the share link of my own homepage, you can also enter my homepage to enter the entrance of other people's homepages:
      bot_detail: Store bot details page
      plugin_detail: store plugins details page
      workflow_detail: Store workflow details page
      bot_community: bot details page
      my_profile_Interactive_panel: Interactive panel for my homepage (followers, fans)
      my_profile_visit_history: Visit history of my homepage
      share_others_link: went to someone else's homepage by sharing the link "
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

  // Process store event
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
  // For parameter meanings, see:
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
  /** Field meaning see  */
  [EVENT_NAMES.template_action_front]: {
    template_id: string;
    template_name: string;
    entity_id: string;
    /** The project template will have a project copy id. */
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
    /** current page */
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
