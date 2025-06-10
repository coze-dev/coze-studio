/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './namespaces/base';
import * as bot from './namespaces/bot';
import * as bot_common from './namespaces/bot_common';
import * as common_struct from './namespaces/common_struct';
import * as domain_audit from './namespaces/domain_audit';
import * as domain_common from './namespaces/domain_common';
import * as domain_common_value_object from './namespaces/domain_common_value_object';
import * as domain_connector from './namespaces/domain_connector';
import * as domain_draft_bot from './namespaces/domain_draft_bot';
import * as domain_library from './namespaces/domain_library';
import * as domain_model from './namespaces/domain_model';
import * as domain_model_tuning_task from './namespaces/domain_model_tuning_task';
import * as domain_ocean_project from './namespaces/domain_ocean_project';
import * as domain_project_version from './namespaces/domain_project_version';
import * as domain_publish_record from './namespaces/domain_publish_record';
import * as domain_space from './namespaces/domain_space';
import * as domain_tpm_expansion_record from './namespaces/domain_tpm_expansion_record';
import * as domain_tpm_volca_operate_record from './namespaces/domain_tpm_volca_operate_record';
import * as domain_user from './namespaces/domain_user';
import * as domain_user_complete_profile_record from './namespaces/domain_user_complete_profile_record';
import * as intelligence_common_struct from './namespaces/intelligence_common_struct';
import * as method_struct from './namespaces/method_struct';
import * as model from './namespaces/model';
import * as mq_struct from './namespaces/mq_struct';
import * as ocean_project from './namespaces/ocean_project';
import * as ocean_project_common_struct from './namespaces/ocean_project_common_struct';
import * as project from './namespaces/project';
import * as publish from './namespaces/publish';
import * as search from './namespaces/search';
import * as task from './namespaces/task';
import * as task_common from './namespaces/task_common';
import * as task_struct from './namespaces/task_struct';
import * as user_profile from './namespaces/user_profile';

export {
  base,
  bot,
  bot_common,
  common_struct,
  domain_audit,
  domain_common,
  domain_common_value_object,
  domain_connector,
  domain_draft_bot,
  domain_library,
  domain_model,
  domain_model_tuning_task,
  domain_ocean_project,
  domain_project_version,
  domain_publish_record,
  domain_space,
  domain_tpm_expansion_record,
  domain_tpm_volca_operate_record,
  domain_user,
  domain_user_complete_profile_record,
  intelligence_common_struct,
  method_struct,
  model,
  mq_struct,
  ocean_project,
  ocean_project_common_struct,
  project,
  publish,
  search,
  task,
  task_common,
  task_struct,
  user_profile,
};
export * from './namespaces/base';
export * from './namespaces/bot';
export * from './namespaces/bot_common';
export * from './namespaces/common_struct';
export * from './namespaces/domain_audit';
export * from './namespaces/domain_common';
export * from './namespaces/domain_common_value_object';
export * from './namespaces/domain_connector';
export * from './namespaces/domain_draft_bot';
export * from './namespaces/domain_library';
export * from './namespaces/domain_model';
export * from './namespaces/domain_model_tuning_task';
export * from './namespaces/domain_ocean_project';
export * from './namespaces/domain_project_version';
export * from './namespaces/domain_publish_record';
export * from './namespaces/domain_space';
export * from './namespaces/domain_tpm_expansion_record';
export * from './namespaces/domain_tpm_volca_operate_record';
export * from './namespaces/domain_user';
export * from './namespaces/domain_user_complete_profile_record';
export * from './namespaces/intelligence_common_struct';
export * from './namespaces/method_struct';
export * from './namespaces/model';
export * from './namespaces/mq_struct';
export * from './namespaces/ocean_project';
export * from './namespaces/ocean_project_common_struct';
export * from './namespaces/project';
export * from './namespaces/publish';
export * from './namespaces/search';
export * from './namespaces/task';
export * from './namespaces/task_common';
export * from './namespaces/task_struct';
export * from './namespaces/user_profile';

export type Int64 = string | number;

export default class IntelligenceApiService<T> {
  private request: any = () => {
    throw new Error('IntelligenceApiService.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || '';
  }

  private genBaseURL(path: string) {
    return typeof this.baseURL === 'string'
      ? this.baseURL + path
      : this.baseURL(path);
  }

  /** POST /api/intelligence_api/ping */
  Ping(
    req?: method_struct.PingRequest,
    options?: T,
  ): Promise<method_struct.PingResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/ping');
    const method = 'POST';
    const data = { Base: _req['Base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/create
   *
   * draft project start
   */
  DraftProjectCreate(
    req?: project.DraftProjectCreateRequest,
    options?: T,
  ): Promise<project.DraftProjectCreateResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/draft_project/create');
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      name: _req['name'],
      description: _req['description'],
      icon_uri: _req['icon_uri'],
      monetization_conf: _req['monetization_conf'],
      create_from: _req['create_from'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/search/get_draft_intelligence_list
   *
   * search start
   */
  GetDraftIntelligenceList(
    req: search.GetDraftIntelligenceListRequest,
    options?: T,
  ): Promise<search.GetDraftIntelligenceListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_draft_intelligence_list',
    );
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      name: _req['name'],
      has_published: _req['has_published'],
      status: _req['status'],
      types: _req['types'],
      search_scope: _req['search_scope'],
      is_fav: _req['is_fav'],
      recently_open: _req['recently_open'],
      option: _req['option'],
      order_by: _req['order_by'],
      cursor_id: _req['cursor_id'],
      size: _req['size'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/draft_project/update */
  DraftProjectUpdate(
    req: project.DraftProjectUpdateRequest,
    options?: T,
  ): Promise<project.DraftProjectUpdateResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/draft_project/update');
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      name: _req['name'],
      description: _req['description'],
      icon_uri: _req['icon_uri'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/search/get_draft_intelligence_info */
  GetDraftIntelligenceInfo(
    req?: search.GetDraftIntelligenceInfoRequest,
    options?: T,
  ): Promise<search.GetDraftIntelligenceInfoResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_draft_intelligence_info',
    );
    const method = 'POST';
    const data = {
      intelligence_id: _req['intelligence_id'],
      intelligence_type: _req['intelligence_type'],
      version: _req['version'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/search/get_recently_edit_intelligence */
  GetUserRecentlyEditIntelligence(
    req?: search.GetUserRecentlyEditIntelligenceRequest,
    options?: T,
  ): Promise<search.GetUserRecentlyEditIntelligenceResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_recently_edit_intelligence',
    );
    const method = 'POST';
    const data = {
      size: _req['size'],
      types: _req['types'],
      enterprise_id: _req['enterprise_id'],
      organization_id: _req['organization_id'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/copy
   *
   * 草稿project复制为草稿project
   */
  DraftProjectCopy(
    req?: project.DraftProjectCopyRequest,
    options?: T,
  ): Promise<project.DraftProjectCopyResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/draft_project/copy');
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      to_space_id: _req['to_space_id'],
      name: _req['name'],
      description: _req['description'],
      icon_uri: _req['icon_uri'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/entity_task/process */
  ProcessEntityTask(
    req?: method_struct.ProcessEntityTaskRequest,
    options?: T,
  ): Promise<method_struct.ProcessEntityTaskResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/entity_task/process');
    const method = 'POST';
    const data = {
      entity_id: _req['entity_id'],
      action: _req['action'],
      task_id_list: _req['task_id_list'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/draft_project/delete */
  DraftProjectDelete(
    req: project.DraftProjectDeleteRequest,
    options?: T,
  ): Promise<project.DraftProjectDeleteResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/draft_project/delete');
    const method = 'POST';
    const data = { project_id: _req['project_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/entity_task/search */
  EntityTaskSearch(
    req?: method_struct.EntityTaskSearchRequest,
    options?: T,
  ): Promise<method_struct.EntityTaskSearchResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/entity_task/search');
    const method = 'POST';
    const data = { task_list: _req['task_list'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/collaboration/list */
  ListIntelligenceCollaboration(
    req: method_struct.ListIntelligenceCollaborationRequest,
    options?: T,
  ): Promise<method_struct.ListIntelligenceCollaborationResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/collaboration/list');
    const method = 'POST';
    const data = {
      intelligence_id: _req['intelligence_id'],
      intelligence_type: _req['intelligence_type'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/ocean_project/create
   *
   * ocean project start
   */
  OceanProjectCreate(
    req?: ocean_project.OceanProjectCreateRequest,
    options?: T,
  ): Promise<ocean_project.OceanProjectCreateResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/ocean_project/create');
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      name: _req['name'],
      description: _req['description'],
      icon_uri: _req['icon_uri'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/ocean_project/update */
  OceanProjectUpdate(
    req: ocean_project.OceanProjectUpdateRequest,
    options?: T,
  ): Promise<ocean_project.OceanProjectUpdateResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/ocean_project/update');
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      name: _req['name'],
      description: _req['description'],
      icon_uri: _req['icon_uri'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/search/get_ocean_project_list */
  GetOceanProjectList(
    req: search.GetOceanProjectListRequest,
    options?: T,
  ): Promise<search.GetOceanProjectListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_ocean_project_list',
    );
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      status: _req['status'],
      search_scope: _req['search_scope'],
      order_by: _req['order_by'],
      page_index: _req['page_index'],
      page_size: _req['page_size'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/publish/publish_project */
  PublishProject(
    req: publish.PublishProjectRequest,
    options?: T,
  ): Promise<publish.PublishProjectResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/publish/publish_project',
    );
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      version_number: _req['version_number'],
      description: _req['description'],
      connectors: _req['connectors'],
      connector_publish_config: _req['connector_publish_config'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/publish/publish_record_detail */
  GetPublishRecordDetail(
    req: publish.GetPublishRecordDetailRequest,
    options?: T,
  ): Promise<publish.GetPublishRecordDetailResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/publish/publish_record_detail',
    );
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      publish_record_id: _req['publish_record_id'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/publish/publish_record_list */
  GetPublishRecordList(
    req: publish.GetPublishRecordListRequest,
    options?: T,
  ): Promise<publish.GetPublishRecordListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/publish/publish_record_list',
    );
    const method = 'POST';
    const data = { project_id: _req['project_id'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/publish/connector_list
   *
   * 发布相关接口
   */
  PublishConnectorList(
    req: publish.PublishConnectorListRequest,
    options?: T,
  ): Promise<publish.PublishConnectorListResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/publish/connector_list');
    const method = 'POST';
    const data = { project_id: _req['project_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/publish/check_version_number */
  CheckProjectVersionNumber(
    req: publish.CheckProjectVersionNumberRequest,
    options?: T,
  ): Promise<publish.CheckProjectVersionNumberResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/publish/check_version_number',
    );
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      version_number: _req['version_number'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/inner_task_list
   *
   * project task start
   */
  DraftProjectInnerTaskList(
    req: task.DraftProjectInnerTaskListRequest,
    options?: T,
  ): Promise<task.DraftProjectInnerTaskListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/draft_project/inner_task_list',
    );
    const method = 'POST';
    const data = { project_id: _req['project_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/search/get_ocean_project_info */
  GetOceanProjectInfo(
    req: search.GetOceanProjectInfoRequest,
    options?: T,
  ): Promise<search.GetOceanProjectInfoResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_ocean_project_info',
    );
    const method = 'POST';
    const data = { project_id: _req['project_id'], Base: _req['Base'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_model_list_filter_params */
  GetModelListFilterParams(
    req?: model.GetModelListFilterParamsRequest,
    options?: T,
  ): Promise<model.GetModelListFilterParamsResponse> {
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_model_list_filter_params',
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/intelligence_api/model/start_estimated_training_cost */
  StartEstimatedTrainingCost(
    req?: model.StartEstimatedTrainingCostRequest,
    options?: T,
  ): Promise<model.StartEstimatedTrainingCostResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/start_estimated_training_cost',
    );
    const method = 'POST';
    const data = {
      base_model_id: _req['base_model_id'],
      space_id: _req['space_id'],
      training_dataset_id: _req['training_dataset_id'],
      epochs: _req['epochs'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/model/get_model_list
   *
   * ---- mode start ----
   */
  GetModelList(
    req?: model.GetModelListRequest,
    options?: T,
  ): Promise<model.GetModelListResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/model/get_model_list');
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      name: _req['name'],
      tag_filters: _req['tag_filters'],
      context_len_min: _req['context_len_min'],
      context_len_max: _req['context_len_max'],
      model_cost_min: _req['model_cost_min'],
      model_cost_max: _req['model_cost_max'],
      model_vendor: _req['model_vendor'],
      statusList: _req['statusList'],
      order_by: _req['order_by'],
      cursor_id: _req['cursor_id'],
      limit: _req['limit'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_finetune_template_dataset */
  GetFinetuneTemplateDataset(
    req?: model.GetFinetuneTemplateDatasetRequest,
    options?: T,
  ): Promise<model.GetFinetuneTemplateDatasetResponse> {
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_finetune_template_dataset',
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/intelligence_api/model/get_model_usage_data */
  GetModelUsageData(
    req?: model.GetModelUsageDataRequest,
    options?: T,
  ): Promise<model.GetModelUsageDataResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_model_usage_data',
    );
    const method = 'POST';
    const data = { space_id: _req['space_id'], model_id: _req['model_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_estimated_training_cost */
  GetEstimatedTrainingCost(
    req?: model.GetEstimatedTrainingCostRequest,
    options?: T,
  ): Promise<model.GetEstimatedTrainingCostResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_estimated_training_cost',
    );
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      space_id: _req['space_id'],
      base_model_id: _req['base_model_id'],
      epochs: _req['epochs'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/create_finetune_task */
  CreateFinetuneTask(
    req?: model.CreateFinetuneTaskRequest,
    options?: T,
  ): Promise<model.CreateFinetuneTaskResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/create_finetune_task',
    );
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      base_model_id: _req['base_model_id'],
      training_dataset_id: _req['training_dataset_id'],
      validating_dataset: _req['validating_dataset'],
      finetune_configuration: _req['finetune_configuration'],
      description: _req['description'],
      name: _req['name'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/upload_finetune_dataset */
  UploadFinetuneDataset(
    req?: model.UploadFinetuneDatasetRequest,
    options?: T,
  ): Promise<model.UploadFinetuneDatasetResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/upload_finetune_dataset',
    );
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      fileType: _req['fileType'],
      fileName: _req['fileName'],
      data: _req['data'],
      testing_data: _req['testing_data'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_model_info */
  GetModelInfo(
    req?: model.GetModelInfoRequest,
    options?: T,
  ): Promise<model.GetModelInfoResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/model/get_model_info');
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      model_id: _req['model_id'],
      is_finetuning: _req['is_finetuning'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_finetune_training_info */
  GetFinetuneTrainingInfo(
    req?: model.GetFinetuneTrainingInfoRequest,
    options?: T,
  ): Promise<model.GetFinetuneTrainingInfoResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_finetune_training_info',
    );
    const method = 'POST';
    const data = { space_id: _req['space_id'], model_id: _req['model_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_model_performance_data */
  GetModelPerformanceData(
    req?: model.GetModelPerformanceDataRequest,
    options?: T,
  ): Promise<model.GetModelPerformanceDataResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_model_performance_data',
    );
    const method = 'POST';
    const data = { space_id: _req['space_id'], model_id: _req['model_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/operate_finetune_task */
  OperateFinetuneTask(
    req?: model.OperateFinetuneTaskRequest,
    options?: T,
  ): Promise<model.OperateFinetuneTaskResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/operate_finetune_task',
    );
    const method = 'POST';
    const data = { id: _req['id'], action: _req['action'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/delete_finetune_model */
  DeleteFinetuneModel(
    req?: model.DeleteFinetuneModelRequest,
    options?: T,
  ): Promise<model.DeleteFinetuneModelResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/delete_finetune_model',
    );
    const method = 'POST';
    const data = { model_id: _req['model_id'], space_id: _req['space_id'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/user_profile/get_user_complete_profile_record
   *
   * ---- user profile start ----
   */
  GetUserCompleteProfileRecord(
    req?: user_profile.GetUserCompleteProfileRecordRequest,
    options?: T,
  ): Promise<user_profile.GetUserCompleteProfileRecordResponse> {
    const url = this.genBaseURL(
      '/api/intelligence_api/user_profile/get_user_complete_profile_record',
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/intelligence_api/user_profile/download_user_profile */
  DownloadUserProfile(
    req?: user_profile.DownloadUserProfileRequest,
    options?: T,
  ): Promise<user_profile.DownloadUserProfileResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/user_profile/download_user_profile',
    );
    const method = 'POST';
    const headers = { Cookie: _req['Cookie'] };
    return this.request({ url, method, headers }, options);
  }

  /**
   * POST /api/intelligence_api/publish/get_published_connector
   *
   * 获取Project发布成功的渠道
   */
  GetProjectPublishedConnector(
    req: publish.GetProjectPublishedConnectorRequest,
    options?: T,
  ): Promise<publish.GetProjectPublishedConnectorResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/publish/get_published_connector',
    );
    const method = 'POST';
    const data = { project_id: _req['project_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/publish/publish_intelligence_unlist */
  PublishIntelligenceUnList(
    req: publish.PublishIntelligenceUnListRequest,
    options?: T,
  ): Promise<publish.PublishIntelligenceUnListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/publish/publish_intelligence_unlist',
    );
    const method = 'POST';
    const data = {
      intelligence_id: _req['intelligence_id'],
      connector_ids: _req['connector_ids'],
      intelligence_type: _req['intelligence_type'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/search/get_publish_intelligence_list */
  PublishIntelligenceList(
    req: search.PublishIntelligenceListRequest,
    options?: T,
  ): Promise<search.PublishIntelligenceListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_publish_intelligence_list',
    );
    const method = 'POST';
    const data = {
      intelligence_type: _req['intelligence_type'],
      space_id: _req['space_id'],
      owner_id: _req['owner_id'],
      name: _req['name'],
      order_last_publish_time: _req['order_last_publish_time'],
      order_total_token: _req['order_total_token'],
      size: _req['size'],
      cursor_id: _req['cursor_id'],
      intelligence_ids: _req['intelligence_ids'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/diff_mode/update_diff_mode_info */
  UpdateDiffModeInfo(
    req: method_struct.UpdateDiffModeInfoRequest,
    options?: T,
  ): Promise<method_struct.UpdateDiffModeInfoResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/diff_mode/update_diff_mode_info',
    );
    const method = 'POST';
    const data = {
      target_type: _req['target_type'],
      target_id: _req['target_id'],
      diff_mode_info: _req['diff_mode_info'],
      exit_and_save: _req['exit_and_save'],
      exit_and_discard: _req['exit_and_discard'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/diff_mode/get_diff_mode_info */
  GetDiffModeInfo(
    req: method_struct.GetDiffModeInfoRequest,
    options?: T,
  ): Promise<method_struct.GetDiffModeInfoResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/diff_mode/get_diff_mode_info',
    );
    const method = 'POST';
    const data = {
      target_type: _req['target_type'],
      target_id: _req['target_id'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/search/get_project_publish_summary */
  GetProjectPublishSummary(
    req: search.GetProjectPublishSummaryRequest,
    options?: T,
  ): Promise<search.GetProjectPublishSummaryResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/search/get_project_publish_summary',
    );
    const method = 'POST';
    const data = { project_id: _req['project_id'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/crossspace_copy
   *
   * 草稿project跨空间复制为草稿project
   */
  DraftProjectCrossSpaceCopy(
    req?: project.DraftProjectCrossSpaceCopyRequest,
    options?: T,
  ): Promise<project.DraftProjectCrossSpaceCopyResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/draft_project/crossspace_copy',
    );
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      to_space_id: _req['to_space_id'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/entity_task/list */
  EntityTaskList(
    req: method_struct.EntityTaskListRequest,
    options?: T,
  ): Promise<method_struct.EntityTaskListResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/entity_task/list');
    const method = 'POST';
    const data = {
      space_id: _req['space_id'],
      task_id_list: _req['task_id_list'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/expansion_tpm */
  ExpansionTpm(
    req?: model.ExpansionTpmRequest,
    options?: T,
  ): Promise<model.ExpansionTpmResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/intelligence_api/model/expansion_tpm');
    const method = 'POST';
    const data = {
      model_id: _req['model_id'],
      enterprise_id: _req['enterprise_id'],
      organization_id: _req['organization_id'],
      tpm_input_expansion: _req['tpm_input_expansion'],
      tpm_output_expansion: _req['tpm_output_expansion'],
      start_time: _req['start_time'],
      end_time: _req['end_time'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_estimated_tpm_expansion_cost */
  GetEstimatedTpmExpansionCost(
    req?: model.GetEstimatedTpmExpansionCostRequest,
    options?: T,
  ): Promise<model.GetEstimatedTpmExpansionCostResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_estimated_tpm_expansion_cost',
    );
    const method = 'POST';
    const data = {
      model_id: _req['model_id'],
      enterprise_id: _req['enterprise_id'],
      input_tpm: _req['input_tpm'],
      output_tpm: _req['output_tpm'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_estimated_tpm_expansion */
  GetEstimatedTpmExpansion(
    req?: model.GetEstimatedTpmExpansionRequest,
    options?: T,
  ): Promise<model.GetEstimatedTpmExpansionResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_estimated_tpm_expansion',
    );
    const method = 'POST';
    const data = {
      model_id: _req['model_id'],
      enterprise_id: _req['enterprise_id'],
      estimated_rpm: _req['estimated_rpm'],
      StartTime: _req['StartTime'],
      EndTime: _req['EndTime'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/archive
   *
   * Project存档
   */
  ArchiveProject(
    req: project.ArchiveProjectRequest,
    options?: T,
  ): Promise<project.ArchiveProjectResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/draft_project/archive');
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      description: _req['description'],
      scene: _req['scene'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /api/intelligence_api/entity_task/task_info */
  GetIntelligenceTaskInfo(
    req: method_struct.GetIntelligenceTaskInfoRequest,
    options?: T,
  ): Promise<method_struct.GetIntelligenceTaskInfoResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/entity_task/task_info');
    const method = 'GET';
    const params = { task_id: _req['task_id'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/history_list
   *
   * 历史记录
   */
  ProjectHistoryList(
    req: project.ProjectHistoryListRequest,
    options?: T,
  ): Promise<project.ProjectHistoryListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/intelligence_api/draft_project/history_list',
    );
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      history_type: _req['history_type'],
      cursor: _req['cursor'],
      size: _req['size'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/intelligence_api/draft_project/rollback
   *
   * 回退存档版本到草稿
   */
  RollbackProject(
    req: project.RollbackProjectRequest,
    options?: T,
  ): Promise<project.RollbackProjectResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/intelligence_api/draft_project/rollback');
    const method = 'POST';
    const data = {
      project_id: _req['project_id'],
      rollback_version: _req['rollback_version'],
      scene: _req['scene'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/intelligence_api/model/get_model_concurrency_performance_data */
  GetModelConcurrencyPerformanceData(
    req?: model.GetModelConcurrencyPerformanceDataRequest,
    options?: T,
  ): Promise<model.GetModelConcurrencyPerformanceDataResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/intelligence_api/model/get_model_concurrency_performance_data',
    );
    const method = 'POST';
    const data = { space_id: _req['space_id'], model_id: _req['model_id'] };
    return this.request({ url, method, data }, options);
  }
}
/* eslint-enable */
