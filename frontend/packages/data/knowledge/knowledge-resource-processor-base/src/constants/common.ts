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

export const SUCCESSFUL_UPLOAD_PROGRESS = 100;

export const POLLING_TIME = 3000;

export const MAX_UNIT_NAME_LEN = 100;

export const BOT_DATA_REFACTOR_CLASS_NAME = 'data-refactor';

export const TABLE_ACCEPT_LOCAL_FILE = ['.xls', '.xlsx', '.csv'];

interface TextUploadChannelConfig {
  acceptFileTypes: string[];
  fileFormatString: string;
  addUnitMaxLimit: number;
}

export type Channel = 'DOUYIN' | 'DEFAULT';

const textUploadChannelConfigMap: Record<Channel, TextUploadChannelConfig> = {
  DOUYIN: {
    acceptFileTypes: ['.pdf', '.txt', '.doc', '.docx'],
    fileFormatString: 'PDF、TXT、DOC、DOCX',
    addUnitMaxLimit: 100,
  },
  DEFAULT: {
    acceptFileTypes: ['.pdf', '.txt', '.docx', '.md'],
    fileFormatString: 'PDF、TXT、DOCX、MD',
    addUnitMaxLimit: 300,
  },
};

export const getTextUploadChannelConfig = (
  channel?: Channel,
): TextUploadChannelConfig =>
  (channel && textUploadChannelConfigMap[channel]) ||
  textUploadChannelConfigMap.DEFAULT;
