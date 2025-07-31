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

export interface IMeta {
  reqType: string;
  resType: string;
  url: string;
  method: string;
  reqMapping: IHttpRpcMapping;
  resMapping?: IHttpRpcMapping; // res mapping
  name: string;
  service: string;
  schemaRoot: string;
  serializer?: string;
}

type Fields = string[];

export interface IHttpRpcMapping {
  path?: Fields; // path parameter
  query?: Fields; // query parameters
  body?: Fields; // Body parameters
  header?: Fields; // header parameter
  status_code?: Fields; // HTTP status code
  cookie?: Fields; // cookie
  entire_body?: Fields;
  raw_body?: Fields;
}

export interface CustomAPIMeta {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  reqMapping?: IHttpRpcMapping;
}
