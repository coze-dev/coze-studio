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

/* eslint-disable @typescript-eslint/naming-convention */

export enum InteractionEvents {
  logout = 'logout',
  loginStatusCheck = 'login_status_check',
  getBotList = 'get_bot_list',
  // getDiscoverBotList = 'get_discover_bot_list', -- deprecated
  // getUserBotFavorite = 'get_user_bot_favorite', -- deprecated
  createBot = 'create_bot',
  updateBot = 'update_bot',
  createOcean = 'create_ocean',
  updateOcean = 'update_ocean',
  // clickBotCard = 'click_bot_card', -- deprecated
  getHistoryInfo = 'get_history_info',
  publishBot = 'publish_bot', // Bot release
  // offlineBot = 'offline_bot', -- deprecated
  botDebugMessageReploy = 'bot_debug_message_reploy', // Bot debug content return
  getDatasetList = 'get_dataset_list', // Get dataset list
  createDataSet = 'create_dataset', // Create dataset
  updateDataset = 'update_dataset', // Update dataset
  deleteDataset = 'delete_dataset',
  submitDatasetUrl = 'submit_dataset_url',
  uploadDatasetFile = 'upload_dataset_file',
  processDatasetTask = 'process_dataset_task',
  datasetGetSliceList = 'dataset_get_slice_list',
  datasetChangeSliceStatus = 'dataset_change_slice_status',
  datasetUpdateDocumnet = 'dataset_update_document',
  datasetUpdateSliceContent = 'dataset_update_slice_content',
  datasetUpdateWebRule = 'dataset_update_web_rule',
  datasetCreateSlice = 'dataset_create_slice',
  datasetDeleteSlice = 'dataset_delete_slice',
  datasetCheckBot = 'dataset_check_bot',
  processSubmitUrl = 'process_submit_url',
  botDebugSaveAll = 'bot_debug_save_all',
  botDebugShareBotGetLink = 'bot_debug_share_bot_get_link',
  // botDebugShareBotOpen = 'bot_debug_share_bot_open', -- deprecated
  // botDebugShareBotClose = 'bot_debug_share_bot_close', -- deprecated
  botDebugGetRecord = 'bot_debug_get_record', // Bot details page initialization
  // botDebugCheckItemId = 'bot_debug_check_item_id', -- deprecated
  botDebugAutosaveItem = 'bot_debug_autosave_item', // Bot auto save
  botDebugGetPluginList = 'bot_debug_get_plugin_list',
  pluginPageGetPluginList = 'plugin_page_get_plugin_list',
  botDebugUploadImage = 'bot_debug_upload_image',
  // botCardShareBotGetLink = 'bot_card_share_bot_get_link', -- deprecated
  botRevert = 'bot_revert',
  botSubmit = 'bot_submit',
  botMergeToDraft = 'bot_merge_to_draft',
  botGetDraftBotInfo = 'bot_get_draft_bot_info', // Bot Get Details
  copy = 'copy',
  botDuplicate = 'bot_duplicate',
  botExperience = 'bot_experience',
  botGetModelVoidTypeList = 'bot_get_model_voice_type_list',
  botGetTaskIntro = 'bot_get_task_intro',
  botCreatePresetTask = 'bot_create_preset_task',
  botGetScheduleTasks = 'bot_get_schedule_tasks',
  botRemoveScheduleTask = 'bot_remove_schedule_task',
  parseJSON = 'parse_json_error',
  botGetAiGenerateAvatar = 'bot_get_ai_generate_avatar', // AI-generated avatar
  ttsVoiceConfig = 'tts_voice_config',
  ttsVoiceToken = 'tts_voice_token',
  ttsVoiceWs = 'tts_voice_ws',
  audioPlayError = 'audio_play_error',
  createDocument = 'create_document',
  botSendMsg = 'bot_send_msg',
}
