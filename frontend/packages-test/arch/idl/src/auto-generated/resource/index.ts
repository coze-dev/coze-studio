/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './namespaces/base';
import * as resource from './namespaces/resource';
import * as resource_common from './namespaces/resource_common';
import * as task_common from './namespaces/task_common';

export { base, resource, resource_common, task_common };
export * from './namespaces/base';
export * from './namespaces/resource';
export * from './namespaces/resource_common';
export * from './namespaces/task_common';

export type Int64 = string | number;

export default class ResourceService<T> {
  private request: any = () => {
    throw new Error('ResourceService.request is undefined');
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
   * POST /api/resource/library_resource_list
   *
   * Coze资源库列表
   */
  LibraryResourceList(
    req: resource.LibraryResourceListRequest,
    options?: T,
  ): Promise<resource.LibraryResourceListResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/resource/library_resource_list');
    const method = 'POST';
    const data = {
      user_filter: _req['user_filter'],
      res_type_filter: _req['res_type_filter'],
      name: _req['name'],
      publish_status_filter: _req['publish_status_filter'],
      space_id: _req['space_id'],
      size: _req['size'],
      cursor: _req['cursor'],
      search_keys: _req['search_keys'],
      is_get_imageflow: _req['is_get_imageflow'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }
}
/* eslint-enable */
