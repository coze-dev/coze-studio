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

export enum DatabaseEvents {
  DatabaseUploadExcelFile = 'database_upload_excel_file',
  DatabaseAddTable = 'database_add_table',
  DatabaseAlterTable = 'database_alter_table',
  DatabaseQueryTable = 'database_query_table',
  DatabaseListTable = 'database_list_table',
  DatabaseDeleteTable = 'database_delete_table',
  DatabaseGetExcelInfo = 'database_get_excel_info',
  DatabaseGetPreviewData = 'database_get_preview_data',
  DatabaseAddFromExcel = 'database_add_from_excel',
  DatabaseGetTaskInfo = 'database_get_task_info',
  DatabaseNL2DB = 'database_nl2db',
  DatabaseResetTableRecords = 'database_reset_table_records',
  DatabaseGetExpertConfig = 'database_get_expert_config',
}
