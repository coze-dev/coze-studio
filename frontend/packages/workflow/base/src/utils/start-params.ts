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
 * 是否预设的开始节点的输入参数
 */
export const isPresetStartParams = (name?: string): boolean =>
  [BOT_USER_INPUT, USER_INPUT, CONVERSATION_NAME].includes(name ?? '');

/**
 * Start 节点参数是 BOT 聊天时用户的输入内容
 * @param name
 * @returns
 */
export const isUserInputStartParams = (name?: string): boolean =>
  [BOT_USER_INPUT, USER_INPUT].includes(name ?? '');
