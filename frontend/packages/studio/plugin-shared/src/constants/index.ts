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

import { I18n } from '@coze-arch/i18n';
import { type TagColor } from '@coze-arch/bot-semi/Tag';
import {
  CreationMethod,
  PluginType as PluginTypeFromApi,
  GrantType,
  APIDebugStatus,
  OnlineStatus,
} from '@coze-arch/bot-api/plugin_develop';

import { type ExtInfoText } from '../types';

export enum PluginType {
  Form = 1,
  Code = 2,
}

export const pluginTypeOption = [
  { label: I18n.t('form_mode'), value: 1 },
  { label: I18n.t('code_mode'), value: 2 },
];

export const locationOption = [
  { label: I18n.t('create_plugin_modal_header'), value: 1 },
  { label: I18n.t('create_plugin_modal_query'), value: 2 },
];

export interface OauthTccOpt {
  key: string;
  label?: string;
  max_len?: number;
  required?: boolean;
  type?: string;
  default?: string;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ruleList?: Array<any>;
}

export const extInfoText: Record<string, ExtInfoText[]> = {
  header_list: [
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_header_list'),
    },
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_header_list1'),
    },
  ],
  auth: [
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_info_all'),
    },
    {
      type: 'br',
    },
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_info_None1'),
    },
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_info_None2'),
    },
    {
      type: 'br',
    },
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_info_Service1'),
    },
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_info_Service2'),
    },
    {
      type: 'br',
    },
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_info_Oauth1'),
    },
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_info_Oauth2'),
    },
  ],
  location: [
    {
      type: 'title',
      text: I18n.t('plugin_location_info_all'),
    },
    {
      type: 'br',
    },
    {
      type: 'title',
      text: I18n.t('plugin_location_info_query'),
    },
    {
      type: 'text',
      text: I18n.t('plugin_location_info_query1'),
    },
    {
      type: 'demo',
      text: I18n.t('plugin_location_info_query2'),
    },
    {
      type: 'br',
    },
    {
      type: 'title',
      text: I18n.t('plugin_location_header'),
    },
    {
      type: 'text',
      text: I18n.t('plugin_location_header1'),
    },
    {
      type: 'demo',
      text: I18n.t('plugin_location_header2'),
    },
  ],
  service_token: [
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_Servicetoken_info1'),
    },
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_Servicetoken_info2'),
    },
  ],
  key: [
    {
      type: 'title',
      text: I18n.t('create_plugin_modal_Parameter_info1'),
    },
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_Parameter_info2'),
    },
  ],
  client_id: [
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_client_id4'),
    },
    {
      type: 'demo',
      text: I18n.t('create_plugin_modal_client_id5'),
    },
  ],
  client_secret: [
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_client_secret4'),
    },
  ],
  client_url: [
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_client_url_info1'),
    },
    {
      type: 'demo',
      text: I18n.t('create_plugin_modal_client_url_info2'),
    },
  ],
  scope: [
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_scope_info1'),
    },
    {
      type: 'demo',
      text: I18n.t('create_plugin_modal_scope_info2'),
    },
  ],
  authorization_url: [
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_authorization_url_info1'),
    },
    {
      type: 'demo',
      text: I18n.t('create_plugin_modal_authorization_url_info2'),
    },
  ],
  authorization_content_type: [
    {
      type: 'text',
      text: I18n.t('create_plugin_modal_authorization_content_type_info1'),
    },
    {
      type: 'demo',
      text: I18n.t('create_plugin_modal_authorization_content_type_info2'),
    },
  ],
  creation_method: [
    {
      type: 'title',
      text: I18n.t(
        'plugin_creation_method_hover_tip_using_existing_services_title',
      ),
    },
    {
      type: 'text',
      text: I18n.t(
        'plugin_creation_method_hover_tip_using_existing_services_desc',
      ),
    },
  ],
  private_link_id: [
    {
      type: 'title',
      text: I18n.t('vpc_plugin_create_plugin_1'),
    },
    {
      type: 'text',
      text: I18n.t('vpc_plugin_tooltips'),
    },
  ],
};

export const authOptionsPlaceholder = {
  client_id: I18n.t('create_plugin_modal_client_id2'),
  client_secret: I18n.t('create_plugin_modal_client_secret2'),
  client_url: I18n.t('create_plugin_modal_client_url_empty'),
  scope: I18n.t('create_plugin_modal_scope_empty'),
  authorization_url: I18n.t('create_plugin_modal_authorization_url_empty'),
  authorization_content_type: I18n.t(
    'create_plugin_modal_authorization_content_type_empty',
  ),
  service_token: I18n.t('create_plugin_modal_Servicetoken_empty'),
  key: I18n.t('create_plugin_modal_Parameter_empty'),
};

export const CLOUD_PLUGIN_COZE = `${PluginTypeFromApi.PLUGIN}-${CreationMethod.COZE}`;
export const CLOUD_PLUGIN_IDE = `${PluginTypeFromApi.PLUGIN}-${CreationMethod.IDE}`;
export const LOCAL_PLUGIN_COZE = `${PluginTypeFromApi.LOCAL}-${CreationMethod.COZE}`;

export const doGetCreationMethodTips = () => extInfoText.creation_method;

export const grantTypeOptions = [
  {
    label: 'TokenExchange',
    value: GrantType.TokenExchange,
  },
  {
    label: 'ClientCredential',
    value: GrantType.ClientCredential,
  },
];
export const PLUGIN_API_TYPE_MAP = new Map<
  APIDebugStatus,
  { label: string; color: TagColor }
>([
  [
    APIDebugStatus.DebugWaiting,
    { label: I18n.t('plugin_api_type_fail'), color: 'red' },
  ],
  [
    APIDebugStatus.DebugPassed,
    { label: I18n.t('plugin_api_type_pass'), color: 'green' },
  ],
]);
export const PLUGIN_SERVICE_MAP = new Map<
  OnlineStatus,
  { label: string; color: string }
>([
  [
    OnlineStatus.ONLINE,
    {
      label: I18n.t('plugin_service_status_online'),
      color: 'var(--plugin-unpublished-color)',
    },
  ],
  [
    OnlineStatus.OFFLINE,
    {
      label: I18n.t('plugin_service_status_offline'),
      color: 'var(--plugin-published-color)',
    },
  ],
]);
