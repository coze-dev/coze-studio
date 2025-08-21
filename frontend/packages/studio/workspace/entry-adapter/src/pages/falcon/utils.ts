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

import { ProductApi } from '@coze-arch/bot-api';

export const replaceUrl = (url: string) =>
  url
    .replace('@minio/public-cbbiz', '/filestore/dev-public-cbbiz')
    .replace('@filestore', '/filestore');

export const parseUrl = (url: string) =>
  url.replace('/filestore/dev-public-cbbiz', '@minio/public-cbbiz');

export const installTypeOptions = [
  {
    label: 'npx',
    value: 'npx',
  },
  {
    label: 'uvx',
    value: 'uvx',
  },
  {
    label: 'sse',
    value: 'sse',
  },
];
