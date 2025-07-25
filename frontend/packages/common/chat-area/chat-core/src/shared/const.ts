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
 * sdk版本号
 */
export const CHAT_CORE_VERSION = '1.1.0';

/**
 * 使用环境
 */
export type ENV = 'local' | 'boe' | 'production' | 'thirdPart';

/**
 * 部署版本
 * release: 正式版
 * inhouse: 内部测试版本
 */

export type DeployVersion = 'release' | 'inhouse';

// 1min -> 60s
export const SECONDS_PER_MINUTE = 60;

// 1s -> 1000ms
export const SECONDS_PER_SECOND = 1000;

// 1min -> 60*1000ms
export const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * SECONDS_PER_SECOND;

// 拉流超时
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 5min更语义化
export const BETWEEN_CHUNK_TIMEOUT = 5 * MILLISECONDS_PER_MINUTE;

// 发送消息超时
export const SEND_MESSAGE_TIMEOUT = MILLISECONDS_PER_MINUTE;

const MAX_RANDOM_NUMBER = 0x10000000;

function getRandomDeviceID() {
  return Math.abs(Date.now() ^ (Math.random() * MAX_RANDOM_NUMBER));
}

export const randomDeviceID = getRandomDeviceID();

// ws 最大重试次数
export const WS_MAX_RETRY_COUNT = 10;

export {
  FileTypeEnum,
  FileType,
  TFileTypeConfig,
  FILE_TYPE_CONFIG,
  getFileInfo,
} from '@coze-studio/file-kit/logic';
