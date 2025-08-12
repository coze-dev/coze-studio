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

export enum FileboxEvents {
  SaveFileboxMode = 'save_filebox_mode',
  GetFileboxPluginsInfo = 'get_filebox_plugin_info',
  GetMDCardDetailPageInfo = 'get_card_detail_info',
  GetMDCardDetailPageInfoInvalid = 'get_card_detail_info_invalid',
  CopyFileboxApiName = 'copy_filebox_api_name',
  FileBoxListFile = 'filebox_list_file',
  FileBoxUpdateFile = 'filebox_update_file',
  FileBoxDeleteFile = 'filebox_delete_file',
  FileBoxUploadFile = 'filebox_upload_file',
}
