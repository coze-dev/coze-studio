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
  // client 工厂方法，要求返回一个 fetchClient 函数，使用 meta 总的信息，可实现灵活的 client 配置
  clientFactory?: (
    meta: IMeta,
  ) => (uri: string, init: RequestInit, opt: any) => any;
  // uri 前缀，如果 client 中设置了，这里可以不设置
  uriPrefix?: string;
  getParams?: (key: string) => string;
  // 服务级别的配置
  services?: ServiceConfig;
  // 开发时，如果本地校验失败，这里可回调，通常是弹 toast
  onVerifyReqError?: (message: string, ctx: any) => void;
}

export interface IOptions {
  config?: IdlConfig;
  // 透传 request options 的选项
  requestOptions?: Record<string, any>;
  [key: string]: any;
}

export interface PathPrams<T> {
  pathParams?: T;
}

export function getConfig(service: string, method: string): IdlConfig {
  // 手动注册的配置优先级比全局变量高
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
    // todo 这里考虑给个默认的 client，防止某些公共 package 在一些异常情况下使用
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
    // 合并了 header，可删除
    delete option.requestOptions.headers;
  }
  if (meta.reqMapping.query && meta.reqMapping.query.length > 0) {
    // 这里默认 skipNulls，网关后端需要忽略 null
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
      // 默认处理为 json ，如有其他场景需要支持，后需要再支持
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

  // 旧版的 ferry 中，即使 idl 没有声明body，也需要加一个 空的 body
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
