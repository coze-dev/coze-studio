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

import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { isObject } from 'lodash-es';
import axios from 'axios';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { CustomError } from '@coze-arch/bot-error';
import { PluginDataFormat } from '@coze-arch/bot-api/plugin_develop';
import {
  AuthorizationServiceLocation,
  AuthorizationType,
  ParameterLocation,
  type commonParamSchema,
  type PluginMetaInfo,
} from '@coze-arch/bot-api/developer_api';

interface PluginInfo {
  aiPlugin?: string;
  openAPI?: string;
}

interface AIPluginMetaInfo {
  name_for_human?: string;
  name_for_model?: string;
  description_for_human?: string;
  description_for_model?: string;
  auth: {
    type?: AIPluginAuthType;
    client_url?: string;
    authorization_url?: string;
    authorization_content_type?: string;
    platform?: string;
    client_id?: string;
    client_secret?: string;
    location?: string;
    key?: string;
    service_token?: string;
    scope?: string;
  };
  logo_url?: string;
  common_params?: {
    header?: Array<commonParamSchema>;
    body?: Array<commonParamSchema>;
    query?: Array<commonParamSchema>;
    path?: Array<commonParamSchema>;
  };
}

interface PluginInfoObject {
  aiPlugin?: AIPluginMetaInfo;
  openAPI?: {
    info?: { description?: string; title?: string; version?: string };
    servers?: Array<{ url?: string }>;
    paths?: Array<unknown>;
    [key: string]: unknown;
  };
}

export enum AIPluginAuthType {
  None = 'none',
  Service = 'service_http',
  OAuth = 'oauth',
}

export enum AIPluginAuthServiceLocation {
  Header = 'Header',
  Query = 'Query',
}

enum ImportFormatType {
  Curl = 'curl',
  OpenApi = 'openapi',
  Postman = 'postman',
  Unknown = '',
  Swagger = 'swagger',
}

export function getFileExtension(name: string) {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1);
}

// @ts-expect-error -- linter-disable-autofix
export async function getContent(file: Blob, onProgress): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;

      if (!result || typeof result !== 'string') {
        reject(new CustomError('normal_error', 'file read fail'));
        return;
      }
      resolve(result);
    };
    fileReader.onprogress = event => {
      if (event.total) {
        onProgress({
          total: event.total,
          loaded: event.loaded,
        });
      }
    };
    fileReader.readAsText(file);
  });
}

export function isValidURL(str?: string): boolean {
  // abbreviated version
  try {
    const objExp = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%_.~+]*)*',
      'i',
    );
    return Boolean(objExp.test(str || ''));
  } catch (e) {
    return false;
  }
}

export async function customService(url: string) {
  // Custom requests are required here, and axios needs to be introduced.
  const axiosInstance = axios.create({ responseType: 'text' });

  const response = await axiosInstance.get(url);
  return response.data;
}

const AUTH_TYPE_MAP: Record<AIPluginAuthType, AuthorizationType> = {
  [AIPluginAuthType.None]: AuthorizationType.None,
  [AIPluginAuthType.Service]: AuthorizationType.Service,
  [AIPluginAuthType.OAuth]: AuthorizationType.OAuth,
};

const AUTH_LOCATION_MAP: Record<
  AIPluginAuthServiceLocation,
  AuthorizationServiceLocation
> = {
  [AIPluginAuthServiceLocation.Header]: AuthorizationServiceLocation.Header,
  [AIPluginAuthServiceLocation.Query]: AuthorizationServiceLocation.Query,
};

export function parsePluginInfo(data: PluginInfo): PluginInfoObject {
  const { aiPlugin, openAPI } = data;
  const aiPluginObj = safeJSONParse(aiPlugin || '{}');
  const openAPIObj = yamlParse(openAPI || '');

  return {
    aiPlugin: aiPluginObj,
    openAPI: openAPIObj,
  };
}

export function getInitialPluginMetaInfo(
  data: PluginInfoObject,
): PluginMetaInfo {
  const { aiPlugin, openAPI } = data;
  const { type, location, key, service_token, ...oauthInfo } =
    aiPlugin?.auth || {};
  return {
    name: aiPlugin?.name_for_human,
    desc: aiPlugin?.description_for_human,
    url: openAPI?.servers?.[0]?.url,
    icon: { uri: aiPlugin?.logo_url },
    auth_type: [AUTH_TYPE_MAP[type || AIPluginAuthType.None]],
    // @ts-expect-error -- linter-disable-autofix
    location: AUTH_LOCATION_MAP[location || ''],
    key,
    service_token,
    oauth_info: JSON.stringify(oauthInfo),
    common_params: {
      [ParameterLocation.Header]: aiPlugin?.common_params?.header || [],
      [ParameterLocation.Body]: aiPlugin?.common_params?.body || [],
      [ParameterLocation.Path]: aiPlugin?.common_params?.path || [],
      [ParameterLocation.Query]: aiPlugin?.common_params?.query || [],
    },
  };
}

function getKeyByValue<V>(
  map: Record<string, V>,
  value?: V,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  for (const [key, val] of Object.entries(map)) {
    if (val === value) {
      return key;
    }
  }
}

export function getRegisterInfo(
  pluginMetaInfo: PluginMetaInfo,
  data: PluginInfo,
): PluginInfo {
  const { aiPlugin: oriAIPluginInfo, openAPI: oriOpenAPIInfo } =
    parsePluginInfo(data);
  const {
    name,
    desc,
    auth_type,
    common_params,
    location,
    key,
    service_token,
    oauth_info,
    icon,
  } = pluginMetaInfo;
  const newAIPlugin: AIPluginMetaInfo = {
    name_for_human: name,
    name_for_model: name,
    description_for_human: desc,
    description_for_model: desc,
    logo_url: icon?.uri,
    common_params: {
      header: common_params?.[ParameterLocation.Header],
      body: common_params?.[ParameterLocation.Body],
      path: common_params?.[ParameterLocation.Path],
      query: common_params?.[ParameterLocation.Query],
    },
    auth: {
      type: getKeyByValue<AuthorizationType>(AUTH_TYPE_MAP, auth_type?.at(0)),
      location: getKeyByValue<AuthorizationServiceLocation>(
        AUTH_LOCATION_MAP,
        location,
      ),
      key,
      service_token,
      ...JSON.parse(oauth_info || '{}'),
    },
  };
  const mergedAIPluginInfo = { ...oriAIPluginInfo, ...newAIPlugin };
  const mergedOpenAPIInfo = {
    ...(oriOpenAPIInfo || {}),
    info: { ...(oriOpenAPIInfo?.info || {}), title: name, description: desc },
    servers: [{ url: pluginMetaInfo.url }],
  };
  return {
    aiPlugin: JSON.stringify(mergedAIPluginInfo),
    openAPI: yamlStringify(mergedOpenAPIInfo),
  };
}

export function getImportFormatType(
  format?: PluginDataFormat,
): ImportFormatType {
  switch (format) {
    case PluginDataFormat.Curl:
      return ImportFormatType.Curl;
    case PluginDataFormat.OpenAPI:
      return ImportFormatType.OpenApi;
    case PluginDataFormat.Postman:
      return ImportFormatType.Postman;
    case PluginDataFormat.Swagger:
      return ImportFormatType.Swagger;
    default:
      return ImportFormatType.Unknown;
  }
}

export const isDuplicatePathErrorResponseData = (value: unknown): boolean =>
  isObject(value) && 'paths_duplicated' in value;
