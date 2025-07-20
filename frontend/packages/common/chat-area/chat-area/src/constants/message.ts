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
 
import { type Message } from '../store/types';

export const FUNCTION_MESSAGE_TYPE_LIST: Message['type'][] = [
  'knowledge',
  'function_call',
  'tool_response',
  'verbose',
];
export const MESSAGE_LIST_SIZE = 15;

export const MARK_MESSAGE_READ_DEBOUNCE_INTERVAL = 500;
export const MARK_MESSAGE_READ_DEBOUNCE_MAX_WAIT = 3000;

export const LOAD_SILENTLY_MAX_NEW_ADDED_COUNT = 6;

// 5s 内调用 get_message_list 超过 3 次，则对请求排队，排队间隔1s
export const LOAD_MORE_CALL_GET_HISTORY_LIST_TIME_WINDOW = 5000;
export const LOAD_MORE_CALL_GET_HISTORY_LIST_LIMIT = 3;
export const LOAD_MORE_CALL_GET_HISTORY_LIST_EXCEED_RATE_DELAY = 1000;

export const CURSOR_TO_LOAD_LATEST_MESSAGE = '0';
export const CURSOR_TO_LOAD_LAST_READ_MESSAGE = '-1';

export const LOAD_EAGERLY_LOAD_MESSAGE_COUNT = 20;
/** 并没有做多页同步加载的机制，因此丢弃策略数量与 eagerly 最大加载数量对齐 */
export const MIN_MESSAGE_INDEX_DIFF_TO_ABORT_CURRENT =
  LOAD_EAGERLY_LOAD_MESSAGE_COUNT - 1;

/** 服务端没有 reply_id 时可能给这种值 */
export const SERVER_MESSAGE_REPLY_ID_PLACEHOLDER_VALUES = ['0', '-1'];
