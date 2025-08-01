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

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
}

export enum AuthType {
  BasicAuth = 'BASIC_AUTH',
  Bearer = 'BEARER_AUTH',
  Custom = 'CUSTOM_AUTH',
}

export const authTypeToLabelKey = {
  [AuthType.BasicAuth]: 'node_http_auth_basic',
  [AuthType.Bearer]: 'node_http_auth_bearer',
  [AuthType.Custom]: 'node_http_auth_custom',
};

export const authTypeToField = {
  [AuthType.BasicAuth]: 'basicAuthData',
  [AuthType.Bearer]: 'bearerTokenData',
  [AuthType.Custom]: 'customData',
};

export enum CustomAuthAddToType {
  Header = 'header',
  Query = 'query',
}

export enum BodyType {
  Empty = 'EMPTY',
  Json = 'JSON',
  FormData = 'FORM_DATA',
  FormUrlEncoded = 'FORM_URLENCODED',
  RawText = 'RAW_TEXT',
  Binary = 'BINARY',
}

export const bodyTypeToField = {
  [BodyType.Empty]: 'empty',
  [BodyType.Json]: 'json',
  [BodyType.FormData]: 'formData',
  [BodyType.FormUrlEncoded]: 'formURLEncoded',
  [BodyType.RawText]: 'rawText',
  [BodyType.Binary]: 'binary',
};

export const bodyTypeToLabel = {
  [BodyType.Empty]: 'node_http_body_none',
  [BodyType.Json]: 'node_http_body_json',
  [BodyType.FormData]: 'node_http_body_form_data',
  [BodyType.FormUrlEncoded]: 'node_http_body_form_urlencoded',
  [BodyType.RawText]: 'node_http_body_raw_text',
  [BodyType.Binary]: 'node_http_body_binary',
};

export const contentTypeToBodyType = {
  'text/plain': BodyType.RawText,
  'multipart/form-data': BodyType.FormData,
  'application/json': BodyType.Json,
  'application/x-www-form-urlencoded': BodyType.FormUrlEncoded,
  'application/octet-stream': BodyType.RawText,
  Empty: BodyType.Empty,
};
