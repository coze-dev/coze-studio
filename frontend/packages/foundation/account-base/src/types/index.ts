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
 * User information of the currently logged in account
 */
export interface UserInfo {
  app_id: number;
  /**
   * @Deprecated will lose precision due to overflow, use user_id_str
   */
  user_id: number;
  user_id_str: string;
  odin_user_type: number;
  name: string;
  screen_name: string;
  avatar_url: string;
  user_verified: boolean;
  email?: string;
  email_collected: boolean;
  expend_attrs?: Record<string, unknown>;
  phone_collected: boolean;
  verified_content: string;
  verified_agency: string;
  is_blocked: number;
  is_blocking: number;
  bg_img_url: string;
  gender: number;
  media_id: number;
  user_auth_info: string;
  industry: string;
  area: string;
  can_be_found_by_phone: number;
  mobile: string;
  birthday: string;
  description: string;
  status: number;
  new_user: number;
  first_login_app: number;
  session_key: string;
  is_recommend_allowed: number;
  recommend_hint_message: string;
  followings_count: number;
  followers_count: number;
  visit_count_recent: number;
  skip_edit_profile: number;
  is_manual_set_user_info: boolean;
  device_id: number;
  country_code: number;
  has_password: number;
  share_to_repost: number;
  user_decoration: string;
  user_privacy_extend: number;
  old_user_id: number;
  old_user_id_str: string;
  sec_user_id: string;
  sec_old_user_id: string;
  vcd_account: number;
  vcd_relation: number;
  can_bind_visitor_account: boolean;
  is_visitor_account: boolean;
  is_only_bind_ins: boolean;
  user_device_record_status: number;
  is_kids_mode: number;
  source: string;
  is_employee: boolean;
  passport_enterprise_user_type: number;
  need_device_create: number;
  need_ttwid_migration: number;
  user_auth_status: number;
  user_safe_mobile_2fa: string;
  safe_mobile_country_code: number;
  lite_user_info_string: string;
  lite_user_info_demotion: number;
  app_user_info: {
    user_unique_name?: string;
  };
  need_check_bind_status: boolean;
  bui_audit_info?: {
    audit_info: {
      user_unique_name?: string;
      avatar_url?: string;
      name?: string;
      [key: string]: unknown;
    }; // Record<string, unknown>;
    // int value. 1 During the review, 2 passed the review, and 3 failed the review.
    audit_status: 1 | 2 | 3;
    details: Record<string, unknown>;
    is_auditing: boolean;
    last_update_time: number;
    unpass_reason: string;
  };
}

/**
 * login status
 * - settling: In the login status detection, it is generally used for the first screen, and there will be a certain delay.
 * - not_login: not logged in
 * - logined: logged in
 */
export type LoginStatus = 'settling' | 'not_login' | 'logined';
