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

import { BOT_USER_INPUT, CONVERSATION_NAME, USER_INPUT } from '../constants';
/**
 * Whether to preset the input parameters of the start node
 */
export const isPresetStartParams = (name?: string): boolean =>
  [BOT_USER_INPUT, USER_INPUT, CONVERSATION_NAME].includes(name ?? '');

/**
 * The Start node parameter is the user's input during BOT chat
 * @param name
 * @returns
 */
export const isUserInputStartParams = (name?: string): boolean =>
  [BOT_USER_INPUT, USER_INPUT].includes(name ?? '');
