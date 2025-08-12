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

export enum ReportEventNames {
  ClearHistory = 'chat_area_clear_history',
  ClearContext = 'chat_area_clear_context',
  BreakMessage = 'chat_area_break_message',
  BreakMessageAccurately = 'chat_area_break_message_accurately',
  Init = 'chat_area_init',
  GetMessageList = 'chat_area_get_message_list',
  SendMessage = 'chat_area_send_message',
  DeleteMessage = 'chat_area_delete_message',
  TriggerEvent = 'chat_area_trigger_event',
  UpdateSenderInfoByHistoryFail = 'chat_area_update_sender_info_by_history_fail',
  NonHistoricalMessageWithoutLocalId = 'non_historical_message_without_local_id',
  MarkMessageRead = 'chat_area_mark_message_read',
  LoadSilently = 'chat_area_load_silently',
  LoadEagerly = 'chat_area_load_eagerly',
  LoadMoreConsumeMessageIndexChange = 'chat_area_load_more_consume_message_index_change',
  LoadMoreResetIndexStoreOnClearHistory = 'chat_area_load_more_reset_index_store_on_clear_history',
  LoadMoreOnMessageUnexpectedIndexChange = 'chat_area_load_more_on_message_unexpected_index_change',
  GetHooksMessageHeaderConfig = 'get_hooks_message_header_config',
  MessageUnitRoleHooksError = 'message_unit_role_hooks_error',
}

export enum ReportErrorEventNames {
  OldChatMessageImageStructNotImageObjectError = 'chat_area_old_chat_message_image_struct_not_image_object_error',
  LoadByScrollPrevFail = 'chat_area_load_by_scroll_prev_fail',
  LoadByScrollNextFail = 'chat_area_load_by_scroll_next_fail',
  MarkMessageReadFail = 'chat_area_mark_message_read_fail',
  LoadSilentlyFail = 'chat_area_load_silently_fail',
  LoadEagerlyFail = 'chat_area_load_eagerly_fail',
  RefreshMessageIndexFail = 'chat_area_refresh_message_index_fail',
  LoadInitialGetUnreadMessageIdFail = 'chat_area_load_initial_get_unread_message_fail',
  LoadInitialGetReadMessageFail = 'chat_area_load_initial_get_read_message_fail',
  LoadMoreResetIndexStoreOnClearHistoryFail = 'chat_area_load_more_reset_index_store_on_clear_history_fail',
}
