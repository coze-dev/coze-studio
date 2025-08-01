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

export enum KnowledgeEvents {
  // knowledge
  KnowledgeListDataset = 'knowledge_list_dataset',
  KnowledgeCreateKnowledge = 'knowledge_create_knowledge',
  KnowledgeUpdateKnowledge = 'knowledge_update_knowledge',
  KnowledgeUpdateDocumentStatus = 'knowledge_update_document_status',
  KnowledgeDeleteDocument = 'knowledge_delete_document',
  KnowledgeListDocument = 'knowledge_list_document',
  KnowledgeGetBotListByDataset = 'knowledge_get_bot_by_dataset',
  KnowledgeCheckBot = 'knowledge_check_bot',
  KnowledgeGetSliceList = 'knowledge_get_slice_list',
  KnowledgeProcessDocument = 'knowledge_process_document',
  KnowledgeSubmitWebURL = 'knowledge_submit_web_url',
  KnowledgeQueryWebInfo = 'knowledge_query_web_info',
  KnowledgeProcessWebDocument = 'knowledge_process_web_document',
  KnowledgeCreateDocument = 'knowledge_create_document',
  KnowledgeCreateSlice = 'knowledge_create_slice',
  KnowledgeUpdateSlice = 'knowledge_update_slice',
  KnowledgeDeleteSlice = 'knowledge_delete_slice',
  KnowledgeUploadFile = 'knowledge_upload_file',
  KnowledgeParseFile = 'knowledge_parse_file',
  KnowledgeGetTaskProgress = 'knowledge_get_task_progress',
  KnowledgeRenameDocument = 'knowledge_rename_document',
  KnowledgeUpdateDocumentFrequency = 'knowledge_update_document_frequency',
  KnowledgeUpdateDocumentName = 'knowledge_update_document_name',
  KnowledgeGetThirdDataSource = 'Knowledge_get_third_data_source',
  KnowledgeGetTableInfo = 'knowledge_get_table_info',
  KnowledgeGetAuthorizeFile = 'knowledge_get_authorize_file',
  KnowledgeUpdateDocument = 'knowledge_update_document',
  KnowledgeResegment = 'knowledge_resegment',
  KnowledgeTableSchemaValid = 'knowledge_table_schema_valid',
  KnowledgeTableAddSegment = 'knowledge_table_add_segment',
  KnowledgeDatasetsSegmentsFile = 'knowledge_datasets_segments_file',
  KnowledgeUseListDataSetReq = 'knowledge_use_list_data_set_req',
  KnowledgeListDataSet = 'knowledge_list_data_set',
  KnowledgeParseSiteMapUrl = 'knowledge_parse_site_map_url',
  KnowledgeCreateSubLinkDiscoveryTask = 'knowledge_create_sub_link_discovery_task',
  KnowledgeGetSubLinkDiscoveryTask = 'knowledge_get_sub_link_discovery_task',
  KnowledgeAbortSubLinkDiscoveryTask = 'knowledge_abort_sub_link_discovery_task',
  KnowledgeSubmitBatchCrawlTask = 'knowledge_submit_batch_crawl_task',
  KnowledgeSubmitBatchUrlCount = 'knowledge_submit_batch_url_count',
  KnowledgeSourceGetURL = 'knowledge_source_get_url',
  KnowledgePhotoList = 'knowledge_photo_list',
  KnowledgeUpdatePhotoCaption = 'knowledge_update_photo_caption',
  KnowledgeGeneratePhotoCaption = 'knowledge_generate_photo_caption',
  KnowledgeFetchWebUrl = 'knowledge_fetch_web_url',
  KnowledgeBatchUpdateDocument = 'knowledge_batch_update_document',
  KnowledgeGetDatasetRefDetail = 'knowledge_get_dataset_ref_detail',
  KnowledgeUpdateWechatFrequency = 'knowledge_update_wechat_frequency',
  KnowledgeGetAuthList = 'knowledge_get_auth_list',

  // timeCapsule
  TimeCapsuleListItems = 'time_capsule_list_items',
  TimeCapsuleClearItems = 'time_capsule_clear_items',
  TimeCapsuleClearItemsInvalid = 'time_capsule_clear_items_invalid',
  TimeCapsuleSummary = 'time_capsule_summary',
  TimeCapsuleUpdateItem = 'time_capsule_update_item',
  TimeCapsuleDeleteItems = 'time_capsule_delete_items',
  TimeCapsulePluginJsonParseError = 'time_capsule_plugin_json_parse_error',

  // third document
  KnowledgeProcessThirdDocument = 'knowledge_process_third_document',
  KnowledgeAssociateFile = 'knowledge_associate_file',
  KnowledgeThirdAuth = 'knowledge_third_auth',
  KnowledgeThirdFileCheck = 'knowledge_third_file_check',

  // third dataSource
  KnowledgeDataSourceFetch = 'knowledge_third_data_source_fetch',
  KnowledgeDataSourceDelete = 'knowledge_third_data_source_delete',
  KnowledgeGetThirdPartyGray = 'knowledge_get_third_party_gray',

  //table view
  KnowledgeTableViewGetColWidth = 'knowledge_table_view_get_col_width',
  KnowledgeTableViewSetColWidth = 'knowledge_table_view_set_col_width',

  // feishu
  KnowledgeConnectorListFetch = 'knowledge_connector_list_fetch',
  KnowledgeGetConnectorEntity = 'knowledge_get_connector_entity',
  KnowledgeConnectorTaskSubmit = 'knowledge_connector_task_submit',
  KnowledgeConnectorTaskRetry = 'knowledge_connector_task_retry',
  KnowledgeConnectorTaskCancel = 'knowledge_connector_task_cancel',
  KnowledgeConnectorTaskPoll = 'knowledge_connector_task_poll',
  KnowledgeGetOAuthConsentURL = 'knowledge_get_oauth_url',
  KnowledgeDeleteConnectorAuth = 'knowledge_delete_connector_auth',
  KnowledgeSearchFeishuDocument = 'knowledge_search_feishu_document',
  KnowledgeGetFeishuDocumentTreeList = 'knowledge_get_feishu_document_tree_list',

  // Knowledge base in bot page
  KnowledgeGetDataSetList = 'knowledge_get_dataset_list',

  // New Knowledge Base Interaction
  KnowledgeGetDataSetDeatil = 'knowledge_get_dataset_detail',

  KnowledgeRefreshDocument = 'knowledge_refresh_document',
}
