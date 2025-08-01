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
 * SDK version number
 */
export const CHAT_CORE_VERSION = '1.1.0';

/**
 * usage environment
 */
export type ENV = 'local' | 'boe' | 'production' | 'thirdPart';

/**
 * Deployment version
 * Release: Official Version
 * Inhouse: dogfooding version
 */

export type DeployVersion = 'release' | 'inhouse';

// 1min -> 60s
export const SECONDS_PER_MINUTE = 60;

// 1s -> 1000ms
export const SECONDS_PER_SECOND = 1000;

// 1min -> 60*1000ms
export const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * SECONDS_PER_SECOND;

// Pull stream timeout
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 5min more semantic
export const BETWEEN_CHUNK_TIMEOUT = 5 * MILLISECONDS_PER_MINUTE;

// Send message timed out
export const SEND_MESSAGE_TIMEOUT = MILLISECONDS_PER_MINUTE;

const MAX_RANDOM_NUMBER = 0x10000000;

function getRandomDeviceID() {
  return Math.abs(Date.now() ^ (Math.random() * MAX_RANDOM_NUMBER));
}

export const randomDeviceID = getRandomDeviceID();

// WS maximum number of retries
export const WS_MAX_RETRY_COUNT = 10;

export {
  FileTypeEnum,
  FileType,
  TFileTypeConfig,
  FILE_TYPE_CONFIG,
  getFileInfo,
} from '@coze-studio/file-kit/logic';
