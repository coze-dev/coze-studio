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

declare namespace DataItem {
  interface UserConnectItem {
    platform: string;
    profile_image_url: string;
    expired_time: number;
    expires_in: number;
    platform_screen_name: string;
    user_id: number;
    platform_uid: string;
    sec_platform_uid: string;
    platform_app_id: number;
    modify_time: number;
    access_token: string;
    open_id: string;
  }

  interface UserInfo {
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
   * The return data structure for sending the verification code
   */
  interface SendCodeData {
    mobile: string;
    mobile_ticket: string;
    retry_time: number;
  }

  interface bindWithEmailLoginParams {
    access_token?: string;
    access_token_secret?: string;
    code?: string;
    openid?: number;
    profile_key?: string;
    platform_app_id: number;
    redirect_uri?: string;
    extra_params?: object;
  }

  interface UserCheckResponse {
    app_user_info?: null;
    authType: number;
    error_code?: number;
    in_old_process?: boolean;
    oauth_platforms?: string[] | null;
    platform_user_names?: Record<string, unknown>;
    userType?: number;
    value_ticket: string;
  }

  interface ValidateCodeResponse {
    ticket: string;
  }

  interface AuthorizeResponse {
    token: string;
    user_info: {
      user_id: number;
      app_id: number;
      user_name: string;
      screen_name: string;
      mobile: string;
      email: string;
      avatar_url: string;
      description: string;
      create_time: number;
      is_new_user: boolean;
      is_new_connect: boolean;
      session_key: string;
      session_app_id: number;
      safe_mobile: string;
    };
  }

  interface AuthLoginParams {
    platform_app_id: number;
    code?: string;
    access_token?: string;
    access_token_secret?: string;
    openid?: string;
    profile_key?: string;
    login_only?: boolean;
    extra_params?: object;
  }
  interface bindWithEmailLoginParams {
    access_token?: string;
    access_token_secret?: string;
    code?: string;
    openid?: number;
    profile_key?: string;
    platform_app_id: number;
    redirect_uri?: string;
    extra_params?: object;
  }

  interface bindWithMobileLoginParams {
    code?: string;
    profile_key?: string;
    access_token?: string;
    platform_app_id: number;
    platform: string;
    need_mobile?: number;
    check_mobile?: number;
    change_bind?: number;
    extra_params?: object;
  }

  interface ResetByEmailTicket {
    ticket: string;
  }
  interface AuditItem {
    pass: boolean;
    title: string;
    text: string[];
    reason: string[] | null;
  }

  interface CancelCheckResponse {
    business_audit: AuditItem;
    cancel_ticket: string;
    common_audit: AuditItem;
    error_code: number;
    protocol: string;
    punish_audit: AuditItem;
    user_permission_audit: AuditItem;
  }
  interface UploadAvatarResponse {
    web_uri: string;
  }
}
