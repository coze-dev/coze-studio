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

import { FILE_TYPE_CONFIG } from '@coze-common/chat-core/shared/const';

const BYTES = 1024;
export const MAX_FILE_MBYTE = 500;

export const DEFAULT_MAX_FILE_SIZE = MAX_FILE_MBYTE * BYTES * BYTES;

export const enum UploadType {
  IMAGE = 0,
  FILE = 1,
}

export const ACCEPT_FILE_EXTENSION = FILE_TYPE_CONFIG.map(cnf => cnf.accept)
  .flat(1)
  .join(',');
