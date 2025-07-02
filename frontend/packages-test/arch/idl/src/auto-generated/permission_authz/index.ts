/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as permission from './namespaces/permission';
import * as principal from './namespaces/principal';
import * as resource from './namespaces/resource';
import * as role from './namespaces/role';

export { permission, principal, resource, role };
export * from './namespaces/permission';
export * from './namespaces/principal';
export * from './namespaces/resource';
export * from './namespaces/role';

export type Int64 = string | number;

export default class PermissionAuthzService<T> {
  private request: any = () => {
    throw new Error('PermissionAuthzService.request is undefined');
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
}
/* eslint-enable */
