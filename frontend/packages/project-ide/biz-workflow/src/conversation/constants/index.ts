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

// Default session unique_id
export const DEFAULT_UNIQUE_ID = '0';

export const DEFAULT_CONVERSATION_NAME = 'Default';

export const MAX_LIMIT = 1000;

export enum ErrorCode {
  DUPLICATE = 'duplicate',
  EXCEED_MAX_LENGTH = 'exceed-max-length',
}

export const MAX_INPUT_LEN = 200;

/**
 * Debug channel id
 */
export const DEBUG_CONNECTOR_ID = '_10000010';

export const DEFAULT_CONNECTOR = {
  connectorId: DEBUG_CONNECTOR_ID,
  connectorName: I18n.t('workflow_saved_database'),
};

export const COZE_CONNECTOR_ID = '10000010';
export const API_CONNECTOR_ID = '1024';
export const CHAT_SDK_CONNECTOR_ID = '999';
export const COZE_CONNECTOR_IDS = [COZE_CONNECTOR_ID, '10000122', '10000129'];
/**
 * Conversation that does not exist
 */
export const DISABLED_CONVERSATION = '0';

/**
 * Only show these online channels, other backends do not support @qiangshunliang.
 */
export const ALLOW_CONNECTORS = [
  COZE_CONNECTOR_ID,
  API_CONNECTOR_ID,
  CHAT_SDK_CONNECTOR_ID,
];
