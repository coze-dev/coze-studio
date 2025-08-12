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

import qs from 'qs';

import type { IMeta } from './types';
import { configCenter } from './config-center';

export interface ServiceConfig {
  [key: string]: {
    methods?: {
      [key: string]: Omit<IdlConfig, 'clientFactory'>;
    };
  } & Omit<IdlConfig, 'clientFactory'>;
}
export interface IdlConfig {
  // The client factory method requires a fetchClient function to be returned, which uses the meta total information to achieve flexible client configuration
  clientFactory?: (
    meta: IMeta,
  ) => (uri: string, init: RequestInit, opt: any) => any;
  // URI prefix, if set in client, you can leave it unset here
  uriPrefix?: string;
  getParams?: (key: string) => string;
  // Service level configuration
  services?: ServiceConfig;
  // During development, if the local verification fails, it can be called back here, usually by playing toast.
  onVerifyReqError?: (message: string, ctx: any) => void;
}

export interface IOptions {
  config?: IdlConfig;
  // Passthrough request options
  requestOptions?: Record<string, any>;
  [key: string]: any;
}

export interface PathPrams<T> {
  pathParams?: T;
}

export function getConfig(service: string, method: string): IdlConfig {
  // Manually registered configuration takes precedence over global variables
  let config: IdlConfig | undefined = configCenter.getConfig(service);
  if (!config) {
    config = {};
    if (config.services && config.services[service]) {
      const serviceConfig = config.services[service];
      const { methods, ...rest } = serviceConfig;
      Object.assign(config, rest);
      if (methods && methods[method]) {
        Object.assign(config, methods[method]);
      }
    }
    delete config.services;
  }
  return config;
}

function getValue(origin: any, fields: string[]) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const res = {} as Record<string, any>;
  fields.forEach(i => {
    res[i] = origin[i];
  });
  return res;
}

// eslint-disable-next-line max-params
export function unifyUrl(
  uri: string,
  pathParams: string[],
  option: IdlConfig & PathPrams<any>,
  req: Record<string, any>,
): { apiUri: string; unmappedParams: string[] } {
  let apiUri = uri;
  pathParams = pathParams || [];
  const unmappedParams = [] as string[];
  const matches = apiUri.match(/:([^/]+)/g) || [];
  if (matches.length === 0) {
    return { apiUri, unmappedParams };
  }

  matches.forEach(item => {
    const target = item.slice(1);
    if (!pathParams.includes(target)) {
      const param =
        option.pathParams?.[target] ||
        (option.getParams && option.getParams(target));
      apiUri = apiUri.replace(item, param || '');
      unmappedParams.push(target);
    } else {
      const param =
        req[target] ||
        option.pathParams?.[target] ||
        option.pathParams?.[target] ||
        (option.getParams && option.getParams(target));
      apiUri = apiUri.replace(item, param);
    }
  });
  return { apiUri, unmappedParams };
}

const ContentTypeMap = {
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'multipart/form-data',
};

// eslint-disable-next-line complexity
export function normalizeRequest(
  req: Record<string, any>,
  meta: IMeta,
  option?: IOptions & PathPrams<any>,
) {
  const config = {
    ...getConfig(meta.service, meta.method),
    ...(option?.config ?? {}),
  };
  const { apiUri } = unifyUrl(
    meta.url,
    meta.reqMapping.path || [],
    { ...config, pathParams: option?.pathParams ?? {} },
    req,
  );
  const { uriPrefix = '', clientFactory } = config;
  if (!clientFactory) {
    // Todo here considers giving a default client to prevent some public packages from being used in some abnormal cases
    throw new Error('Lack of clientFactory config');
  }
  let uri = uriPrefix + apiUri;
  let headers: Record<string, string> = {};

  headers['Content-Type'] =
    meta.serializer && ContentTypeMap[meta.serializer]
      ? ContentTypeMap[meta.serializer]
      : 'application/json';
  if (option?.requestOptions?.headers) {
    headers = { ...headers, ...option.requestOptions.headers };
    // Merged headers, can be deleted
    delete option.requestOptions.headers;
  }
  if (meta.reqMapping.query && meta.reqMapping.query.length > 0) {
    // The default here is skipNulls, and the gateway backend needs to ignore null.
    uri = `${uri}?${qs.stringify(getValue(req, meta.reqMapping.query), {
      skipNulls: true,
      arrayFormat: 'comma',
    })}`;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const requestOption = {
    method: meta.method,
    headers,
    credentials: 'same-origin',
  } as RequestInit;

  if (meta.reqMapping.entire_body && meta.reqMapping.entire_body.length > 0) {
    if (meta.reqMapping.entire_body.length === 1) {
      // The default processing is json. If there are other scenarios that need to be supported, they need to be supported later.
      requestOption.body = req[meta.reqMapping.entire_body[0]];
    } else {
      throw new Error('idl invalid entire_body should be only one filed');
    }
  } else if (meta.reqMapping.body && meta.reqMapping.body.length > 0) {
    const body = getValue(req, meta.reqMapping.body);
    requestOption.body = body as BodyInit;
    if (meta.serializer === 'form') {
      const formData = new FormData();
      Object.keys(body).forEach(key => {
        const formItemValue =
          body[key] instanceof File
            ? new Blob([body[key]], { type: body[key].type })
            : body[key];

        formData.append(key, formItemValue);
      });
      requestOption.body = formData;
    }
    if (meta.serializer === 'urlencoded') {
      requestOption.body = qs.stringify(body, {
        skipNulls: true,
        arrayFormat: 'comma',
      });
    }
  }

  if (meta.reqMapping.header && meta.reqMapping.header.length > 0) {
    requestOption.headers = {
      ...headers,
      ...getValue(req, meta.reqMapping.header),
    };
  }

  // In the old version of ferry, even if idl does not declare body, you need to add an empty body.
  if (
    !requestOption.body &&
    ['POST', 'PUT', 'PATCH'].includes(
      (requestOption.method || '').toUpperCase(),
    )
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    requestOption.body = {} as BodyInit;
  }

  return { uri, requestOption, client: clientFactory(meta) };
}
