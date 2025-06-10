/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as ability_provider from './namespaces/ability_provider';
import * as copilot from './namespaces/copilot';
import * as copilot_common from './namespaces/copilot_common';
import * as model_manage from './namespaces/model_manage';
import * as ocean_cloud_admin_api from './namespaces/ocean_cloud_admin_api';

export {
  ability_provider,
  copilot,
  copilot_common,
  model_manage,
  ocean_cloud_admin_api,
};
export * from './namespaces/ability_provider';
export * from './namespaces/copilot';
export * from './namespaces/copilot_common';
export * from './namespaces/model_manage';
export * from './namespaces/ocean_cloud_admin_api';

export type Int64 = string | number;

export default class PromptAdminApiService<T> {
  private request: any = () => {
    throw new Error('PromptAdminApiService.request is undefined');
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

  /**
   * POST /api/admin/v1/model/model_meta/create
   *
   * 模型创建
   */
  CreateModelMeta(
    req: ocean_cloud_admin_api.CreateModelMetaReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CreateModelMetaResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/create');
    const method = 'POST';
    const data = {
      model_name: _req['model_name'],
      family: _req['family'],
      version: _req['version'],
      desc: _req['desc'],
      show_name: _req['show_name'],
      icon: _req['icon'],
      capability: _req['capability'],
      quota: _req['quota'],
      model_config: _req['model_config'],
      prompt_conf: _req['prompt_conf'],
      legacy_fields: _req['legacy_fields'],
      parameters: _req['parameters'],
      display_properties: _req['display_properties'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /**
   * GET /admin/redirect
   *
   * 后端用来鉴权 redirect
   */
  CasLogin(
    req?: ocean_cloud_admin_api.CasLoginReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CasLoginResp> {
    const _req = req || {};
    const url = this.genBaseURL('/admin/redirect');
    const method = 'GET';
    const params = { callback: _req['callback'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /api/admin/v1/model/model_meta/update */
  UpdateModelMeta(
    req?: ocean_cloud_admin_api.UpdateModelMetaReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.UpdateModelMetaResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/update');
    const method = 'POST';
    const data = {
      model_id: _req['model_id'],
      model_name: _req['model_name'],
      family: _req['family'],
      version: _req['version'],
      desc: _req['desc'],
      show_name: _req['show_name'],
      icon: _req['icon'],
      capability: _req['capability'],
      quota: _req['quota'],
      model_config: _req['model_config'],
      prompt_conf: _req['prompt_conf'],
      legacy_fields: _req['legacy_fields'],
      parameters: _req['parameters'],
      display_properties: _req['display_properties'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_meta/delete */
  DeleteModelMeta(
    req?: ocean_cloud_admin_api.DeleteModelMetaReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.DeleteModelMetaResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/delete');
    const method = 'POST';
    const data = { model_id: _req['model_id'] };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_scene/create */
  CreateModelWithScene(
    req: ocean_cloud_admin_api.CreateModelWithSceneReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CreateModelWithSceneResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_scene/create');
    const method = 'POST';
    const data = {
      scene: _req['scene'],
      model_id: _req['model_id'],
      show_name: _req['show_name'],
      ranking: _req['ranking'],
      icon: _req['icon'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_scene/update */
  UpdateModelWithScene(
    req: ocean_cloud_admin_api.UpdateModelWithSceneReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.UpdateModelWithSceneResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_scene/update');
    const method = 'POST';
    const data = {
      scene: _req['scene'],
      model_id: _req['model_id'],
      show_name: _req['show_name'],
      icon: _req['icon'],
      ranking: _req['ranking'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_scene/delete */
  DeleteModelWithScene(
    req: ocean_cloud_admin_api.DeleteModelWithSceneReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.DeleteModelWithSceneResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_scene/delete');
    const method = 'POST';
    const data = { scene: _req['scene'], model_id: _req['model_id'] };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /**
   * POST /api/admin/v1/model/model_meta/list
   *
   * 因为 AGW 中get 入参只支持逗号分割，但是前端请求是roleIds[]=1&roleIds[]=2，所以这里只能用 post 方法
   */
  GetModelMetaList(
    req?: ocean_cloud_admin_api.GetModelMetaListReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GetModelMetaListResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/list');
    const method = 'POST';
    const data = {
      model_id: _req['model_id'],
      status: _req['status'],
      model_name: _req['model_name'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_scene/list */
  GetModelListWithScene(
    req: ocean_cloud_admin_api.GetModelListWithSceneReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GetModelListWithSceneResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_scene/list');
    const method = 'POST';
    const data = {
      scene: _req['scene'],
      has_delete_model: _req['has_delete_model'],
      model_name: _req['model_name'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /**
   * POST /api/admin/v1/model/enum_data_list
   *
   * 一些枚举值的定义，方便前端数据获取
   */
  GetCommonEnumData(
    req?: ocean_cloud_admin_api.GetCommonEnumDataReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GetCommonEnumDataResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/enum_data_list');
    const method = 'POST';
    const data = { enum_type: _req['enum_type'] };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_meta/template */
  GetModelMetaTemplate(
    req?: ocean_cloud_admin_api.GetModelMetaTemplateReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GeteModelMetaTemplateResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/template');
    const method = 'POST';
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, headers }, options);
  }

  /** POST /api/admin/v1/model/model_meta/bind_scene_model_list */
  GetBindSceneModel(
    req?: ocean_cloud_admin_api.GetBindSceneModelReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GetBindSceneModelResp> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/admin/v1/model/model_meta/bind_scene_model_list',
    );
    const method = 'POST';
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, headers }, options);
  }

  /**
   * POST /api/admin/v1/model/perm/get_role_list
   *
   * GetPermModuleListResp GetPermModuleList(1:GetPermModuleListReq req)(api.post = '/api/admin/v1/perm/module_list', api.category = "权限管理") // 用户有权限的模块
   *
   * 获取模型管理拥有的角色权限以及用户当前有的权限
   */
  GetRoleListForModel(
    req?: ocean_cloud_admin_api.GetRoleListForModelReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GetRoleListForModelResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/perm/get_role_list');
    const method = 'POST';
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, headers }, options);
  }

  /** POST /api/admin/v1/model/model_entity/create */
  CreateModelEntity(
    req: ocean_cloud_admin_api.CreateModelEntityReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CreateModelEntityResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_entity/create');
    const method = 'POST';
    const data = { model_name: _req['model_name'], targets: _req['targets'] };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_entity/query */
  QueryModelEntity(
    req?: ocean_cloud_admin_api.QueryModelEntityReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.QueryModelEntityResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_entity/query');
    const method = 'POST';
    const data = {
      model_name: _req['model_name'],
      index: _req['index'],
      page_size: _req['page_size'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /**
   * POST /api/admin/v1/model/model/query
   *
   * 融合后的模型列出和场景列出
   */
  ModelQuery(
    req?: ocean_cloud_admin_api.ModelQueryRequest,
    options?: T,
  ): Promise<ocean_cloud_admin_api.GetModelMetaListResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model/query');
    const method = 'POST';
    const data = {
      ModelIds: _req['ModelIds'],
      Scene: _req['Scene'],
      Status: _req['Status'],
      ModelName: _req['ModelName'],
      Cursor: _req['Cursor'],
      Size: _req['Size'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_meta/query */
  QueryModelMeta(
    req?: ocean_cloud_admin_api.QueryModelMetaReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.QueryModelMetaResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/query');
    const method = 'POST';
    const data = {
      model_name: _req['model_name'],
      index: _req['index'],
      page_size: _req['page_size'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model_entity/update */
  UpdateModelEntity(
    req?: ocean_cloud_admin_api.UpdateModelEntityReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.UpdateModelEntityResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/admin/v1/model/model_entity/update');
    const method = 'POST';
    const data = {
      model_id: _req['model_id'],
      model_name: _req['model_name'],
      targets: _req['targets'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/model/create */
  CreateModel(
    req: ocean_cloud_admin_api.CreateModelMetaReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CreateModelMetaResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model/create');
    const method = 'POST';
    const data = {
      model_name: _req['model_name'],
      family: _req['family'],
      version: _req['version'],
      desc: _req['desc'],
      show_name: _req['show_name'],
      icon: _req['icon'],
      capability: _req['capability'],
      quota: _req['quota'],
      model_config: _req['model_config'],
      prompt_conf: _req['prompt_conf'],
      legacy_fields: _req['legacy_fields'],
      parameters: _req['parameters'],
      display_properties: _req['display_properties'],
    };
    const headers = {
      Referer: _req['Referer'],
      'Ocean-Jwt-Token': _req['Ocean-Jwt-Token'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /api/admin/v1/model/engine_publish/model_deploy */
  CreateModelDeployment(
    req: ocean_cloud_admin_api.CreateModelDeploymentRequest,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CreateModelDeploymentResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/admin/v1/model/engine_publish/model_deploy',
    );
    const method = 'POST';
    const data = {
      Operator: _req['Operator'],
      ModelId: _req['ModelId'],
      ModelName: _req['ModelName'],
      OldModelMetas: _req['OldModelMetas'],
      NewModelMetas: _req['NewModelMetas'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/admin/v1/model/engine_publish/query_deployments */
  QueryDeploymentDetail(
    req: ocean_cloud_admin_api.QueryDeploymentDetailRequest,
    options?: T,
  ): Promise<ocean_cloud_admin_api.QueryDeploymentDetailResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/admin/v1/model/engine_publish/query_deployments',
    );
    const method = 'POST';
    const data = {
      Id: _req['Id'],
      Title: _req['Title'],
      Operator: _req['Operator'],
      Status: _req['Status'],
      PageNum: _req['PageNum'],
      PageSize: _req['PageSize'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/admin/v1/model/engine_publish/chain_deploy */
  CreateChainInfoDeployment(
    req: ocean_cloud_admin_api.CreateChainInfoDeploymentRequest,
    options?: T,
  ): Promise<ocean_cloud_admin_api.CreateChainInfoDeploymentResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/admin/v1/model/engine_publish/chain_deploy',
    );
    const method = 'POST';
    const data = {
      Operator: _req['Operator'],
      TaskId: _req['TaskId'],
      TaskName: _req['TaskName'],
      OldVersion: _req['OldVersion'],
      NewVersion: _req['NewVersion'],
      Cookie: _req['Cookie'],
      FromOversea: _req['FromOversea'],
      AppOwner: _req['AppOwner'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/admin/v1/model/model_meta/query_by_id */
  QueryModelMetaById(
    req: ocean_cloud_admin_api.QueryModelMetaByIdReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.QueryModelMetaByIdResp> {
    const _req = req;
    const url = this.genBaseURL('/api/admin/v1/model/model_meta/query_by_id');
    const method = 'POST';
    const data = { MetaId: _req['MetaId'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/admin/v1/model/engine_publish/rollback_deployment */
  RollBackDeployment(
    req?: ocean_cloud_admin_api.RollBackDeploymentReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.RollBackDeploymentResp> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/admin/v1/model/engine_publish/rollback_deployment',
    );
    const method = 'POST';
    const data = { build_id: _req['build_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/admin/v1/model/engine_publish/update_deployment_status */
  UpdateDeploymentStatus(
    req?: ocean_cloud_admin_api.UpdateDeploymentStatusReq,
    options?: T,
  ): Promise<ocean_cloud_admin_api.UpdateDeploymentStatusResp> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/admin/v1/model/engine_publish/update_deployment_status',
    );
    const method = 'POST';
    const data = {
      BizKey: _req['BizKey'],
      BizType: _req['BizType'],
      Status: _req['Status'],
      DeployId: _req['DeployId'],
    };
    return this.request({ url, method, data }, options);
  }
}
/* eslint-enable */
