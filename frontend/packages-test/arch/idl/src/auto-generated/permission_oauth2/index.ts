/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as openapi from './namespaces/openapi';

export { openapi };
export * from './namespaces/openapi';

export interface AuthorizeConsentRequest2 {
  authorize_key: string;
  consent: boolean;
}

export interface AuthorizeConsentResponse2 {
  code: number;
  msg: string;
  data: openapi.AuthorizeConsentResponseData;
}

export interface DeviceVerificationRequest2 {
  user_code: string;
}

export interface DeviceVerificationResponse2 {
  code: number;
  msg: string;
  data: openapi.DeviceVerificationResponseData;
}

export default class PermissionOauth2Service<T> {
  private request: any = () => {
    throw new Error('PermissionOauth2Service.request is undefined');
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
   * POST /api/permission/oauth2/authorize_consent
   *
   * authorize consent api
   *
   * authorize consent api
   */
  AuthorizeConsent(
    req: AuthorizeConsentRequest2,
    options?: T,
  ): Promise<AuthorizeConsentResponse2> {
    const _req = req;
    const url = this.genBaseURL('/api/permission/oauth2/authorize_consent');
    const method = 'POST';
    const data = {
      authorize_key: _req['authorize_key'],
      consent: _req['consent'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/permission/oauth2/device/verification
   *
   * device verification api
   *
   * device verification api
   */
  DeviceVerification(
    req: DeviceVerificationRequest2,
    options?: T,
  ): Promise<DeviceVerificationResponse2> {
    const _req = req;
    const url = this.genBaseURL('/api/permission/oauth2/device/verification');
    const method = 'POST';
    const data = { user_code: _req['user_code'] };
    return this.request({ url, method, data }, options);
  }
}
/* eslint-enable */
