/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './namespaces/base';
import * as open_api from './namespaces/open_api';

export { base, open_api };
export * from './namespaces/base';
export * from './namespaces/open_api';

export type Int64 = string | number;

export default class DeveloperBackendService<T> {
  private request: any = () => {
    throw new Error('DeveloperBackendService.request is undefined');
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
   * POST /api/open/permission/list
   *
   * API权限管理
   *
   * 获取权限列表
   */
  GetPermissionList(
    req?: open_api.GetPermissionListReq,
    options?: T,
  ): Promise<open_api.GetPermissionListResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/open/permission/list');
    const method = 'POST';
    const data = {
      key_list: _req['key_list'],
      permission_id_list: _req['permission_id_list'],
      version: _req['version'],
      permission_type: _req['permission_type'],
      full_key_list: _req['full_key_list'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/data/analytics
   *
   * ---API 数据展示---
   *
   * 分析页
   */
  GetAPIAnalytics(
    req: open_api.APIAnalyticsReq,
    options?: T,
  ): Promise<open_api.APIAnalyticsResp> {
    const _req = req;
    const url = this.genBaseURL('/api/data/analytics');
    const method = 'GET';
    const params = {
      query_range: _req['query_range'],
      metrics_type: _req['metrics_type'],
      dimension: _req['dimension'],
      Base: _req['Base'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/data/details
   *
   * 详情页
   */
  GetAPIDetails(
    req: open_api.APIDetailsReq,
    options?: T,
  ): Promise<open_api.APIDetailsResp> {
    const _req = req;
    const url = this.genBaseURL('/api/data/details');
    const method = 'GET';
    const params = {
      query_range: _req['query_range'],
      details_type: _req['details_type'],
      Base: _req['Base'],
    };
    return this.request({ url, method, params }, options);
  }

  /** POST /api/open/v2/permission/list */
  GetPermissionListV2(
    req?: open_api.GetPermissionListReq,
    options?: T,
  ): Promise<open_api.GetPermissionListResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/open/v2/permission/list');
    const method = 'POST';
    const data = {
      key_list: _req['key_list'],
      permission_id_list: _req['permission_id_list'],
      version: _req['version'],
      permission_type: _req['permission_type'],
      full_key_list: _req['full_key_list'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/open/playground/item_list
   *
   * 以下是 playground 的接口, 技术方案： 
   *
   * 不需要登陆态
   *
   * 获取所有 playground 的所有接口与 websdk
   */
  GetPlaygroundItemList(
    req?: open_api.GetPlaygroundItemListReq,
    options?: T,
  ): Promise<open_api.GetPlaygroundItemListResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/open/playground/item_list');
    const method = 'GET';
    const params = { Base: _req['Base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/open/playground/api_info
   *
   * 通过 playground api name 获取详情
   */
  GetPlaygroundApiInfo(
    req: open_api.GetPlaygroundApiInfoReq,
    options?: T,
  ): Promise<open_api.GetPlaygroundApiInfoResp> {
    const _req = req;
    const url = this.genBaseURL('/api/open/playground/api_info');
    const method = 'GET';
    const params = { url_key: _req['url_key'], Base: _req['Base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/open/playground/websdk_info
   *
   * 获取 websdk 代码
   */
  GetPlaygroundWebSdkInfo(
    req?: open_api.GetPlaygroundWebSdkInfoReq,
    options?: T,
  ): Promise<open_api.GetPlaygroundWebSdkInfoResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/open/playground/websdk_info');
    const method = 'GET';
    const params = { version: _req['version'], Base: _req['Base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/developer_backend/playground/sync_from_apihub
   *
   * 内网接口，从 apihub 同步 openapi swagger
   *
   * 从 apihub 同步最新的 openapi 接口与描述
   *
   * boe:
   */
  SyncFromApiHub(
    req?: open_api.SyncFromApiHubReq,
    options?: T,
  ): Promise<open_api.SyncFromApiHubResp> {
    const _req = req || {};
    const url = this.genBaseURL(
      '/api/developer_backend/playground/sync_from_apihub',
    );
    const method = 'POST';
    const data = { raw_body: _req['raw_body'], Base: _req['Base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/open/playground/doc
   *
   * arcosite 请求转发. 对外屏蔽 ak/sk
   */
  PlaygroundOpenApiDoc(
    req?: open_api.PlaygroundOpenApiDocReq,
    options?: T,
  ): Promise<open_api.PlaygroundOpenApiDocResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/open/playground/doc');
    const method = 'POST';
    const data = { body: _req['body'], Base: _req['Base'] };
    const headers = {
      'x-arcosite-action': _req['x-arcosite-action'],
      'Content-Type': _req['Content-Type'],
    };
    return this.request({ url, method, data, headers }, options);
  }

  /** GET /api/open/permission/oauth_quickstart_config */
  OauthQuickstartConfig(
    req?: open_api.OauthQuickstartConfigReq,
    options?: T,
  ): Promise<open_api.OauthQuickstartConfigResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/open/permission/oauth_quickstart_config');
    const method = 'GET';
    const params = { client_type: _req['client_type'], Base: _req['Base'] };
    return this.request({ url, method, params }, options);
  }
}
/* eslint-enable */
