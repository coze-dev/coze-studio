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

/** empty method */
export const EmptyFunction = () => {
  /** empty method */
};
export const EmptyAsyncFunction = () => Promise.resolve();

/** Public space ID */
export const PUBLIC_SPACE_ID = '999999';

/** BOT_USER_INPUT variable name */
export const BOT_USER_INPUT = 'BOT_USER_INPUT';

/** USER_INPUT parameters, the new version BOT_USER_INPUT parameters, the same function as BOT_USER_INPUT, Coze2.0 Chatflow requirements are introduced */
export const USER_INPUT = 'USER_INPUT';

/** CONVERSATION_NAME variable name, start node session name imported parameter */
export const CONVERSATION_NAME = 'CONVERSATION_NAME';

/**
 * Workflow name Maximum number of characters
 */
export const WORKFLOW_NAME_MAX_LEN = 30;

/**
 * workflow naming regular
 */
export const WORKFLOW_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

/**
 * Node test ID prefix
 */
export const NODE_TEST_ID_PREFIX = 'playground.node';
