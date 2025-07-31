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
 * Undertake all sdk slardar custom events
 */
export enum SlardarEvents {
  // pull historical exception
  MESSAGE_FETCH_HISTORY_ERROR = 'message_fetch_history_error',
  // clear context exception
  MESSAGE_CLEAR_CONTEXT_ERROR = 'message_clear_context_error',
  // Clear historical anomalies
  MESSAGE_CLEAR_HISTORY_ERROR = 'message_clear_history_error',
  // Delete message exception
  MESSAGE_DELETE_ERROR = 'message_delete_error',
  // interrupt message
  MESSAGE_INTERRUPT_ERROR = 'message_interrupt_error',
  // Like/click on the message
  MESSAGE_REPORT_ERROR = 'message_report_error',
  // speech-to-text
  CHAT_ASR_ERROR = 'chat_asr_error',
}
