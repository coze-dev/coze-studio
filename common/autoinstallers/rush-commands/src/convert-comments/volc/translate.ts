/*
Copyright (year) Beijing Volcano Engine Technology Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import crypto from 'crypto';
import util from 'util';
import { URLSearchParams } from 'url';

const debuglog = util.debuglog('signer');

/**
 * 签名参数接口
 */
export interface SignParams {
  headers?: Record<string, string>;
  query?: Record<string, string | string[] | undefined>;
  region?: string;
  serviceName?: string;
  method?: string;
  pathName?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  needSignHeaderKeys?: string[];
  bodySha?: string;
}

/**
 * 查询参数类型
 */
export type QueryParams = Record<string, string | string[] | undefined | null>;

/**
 * 请求头类型
 */
export type Headers = Record<string, string>;

/**
 * 翻译请求参数接口
 */
export interface TranslateRequest {
  /** 源语言代码 */
  SourceLanguage: string;
  /** 目标语言代码 */
  TargetLanguage: string;
  /** 要翻译的文本列表 */
  TextList: string[];
}

/**
 * 翻译结果中的额外信息
 */
export interface TranslationExtra {
  /** 输入字符数 */
  input_characters: string;
  /** 源语言 */
  source_language: string;
}

/**
 * 单个翻译结果
 */
export interface TranslationItem {
  /** 翻译结果 */
  Translation: string;
  /** 检测到的源语言 */
  DetectedSourceLanguage: string;
  /** 额外信息 */
  Extra: TranslationExtra;
}

/**
 * 响应元数据
 */
export interface ResponseMetadata {
  /** 请求ID */
  RequestId: string;
  /** 操作名称 */
  Action: string;
  /** API版本 */
  Version: string;
  /** 服务名称 */
  Service: string;
  /** 区域 */
  Region: string;
}

/**
 * 火山引擎翻译API响应接口
 */
export interface VolcTranslateResponse {
  /** 翻译结果列表 */
  TranslationList: TranslationItem[];
  /** 响应元数据 */
  ResponseMetadata: ResponseMetadata;
  /** 响应元数据（备用字段） */
  ResponseMetaData?: ResponseMetadata;
}

/**
 * 翻译配置参数
 */
export interface TranslateConfig {
  /** 访问密钥ID */
  accessKeyId: string;
  /** 秘密访问密钥 */
  secretAccessKey: string;
  /** 服务区域 */
  region?: string;
  /** 源语言代码 */
  sourceLanguage?: string;
  /** 目标语言代码 */
  targetLanguage?: string;
}

/**
 * 不参与加签过程的 header key
 */
const HEADER_KEYS_TO_IGNORE = new Set([
  'authorization',
  'content-type',
  'content-length',
  'user-agent',
  'presigned-expires',
  'expect',
]);

/**
 * 火山引擎翻译接口
 * @param textArray 要翻译的文本数组
 * @param config 翻译配置参数，如果不提供则使用默认配置
 * @returns 翻译响应结果
 */
export async function translate(
  textArray: string[],
  config?: Partial<TranslateConfig>,
): Promise<VolcTranslateResponse> {
  const translateConfig: TranslateConfig = {
    accessKeyId: config?.accessKeyId!,
    secretAccessKey: config?.secretAccessKey!,
    region: config?.region!,
    sourceLanguage: 'zh',
    targetLanguage: 'en',
    ...config,
  };

  const requestBody: TranslateRequest = {
    SourceLanguage: translateConfig.sourceLanguage!,
    TargetLanguage: translateConfig.targetLanguage!,
    TextList: textArray,
  };

  const requestBodyString = JSON.stringify(requestBody);
  const signParams: SignParams = {
    headers: {
      // x-date header 是必传的
      'X-Date': getDateTimeNow(),
      'content-type': 'application/json',
    },
    method: 'POST',
    query: {
      Version: '2020-06-01',
      Action: 'TranslateText',
    },
    accessKeyId: translateConfig.accessKeyId,
    secretAccessKey: translateConfig.secretAccessKey,
    serviceName: 'translate',
    region: translateConfig.region!,
    bodySha: getBodySha(requestBodyString),
  };

  // 正规化 query object， 防止串化后出现 query 值为 undefined 情况
  if (signParams.query) {
    for (const [key, val] of Object.entries(signParams.query)) {
      if (val === undefined || val === null) {
        signParams.query[key] = '';
      }
    }
  }

  const authorization = sign(signParams);
  const queryString = new URLSearchParams(
    signParams.query as Record<string, string>,
  ).toString();

  const res = await fetch(
    `https://translate.volcengineapi.com/?${queryString}`,
    {
      headers: {
        ...signParams.headers,
        Authorization: authorization,
      },
      body: requestBodyString,
      method: signParams.method,
    },
  );

  if (!res.ok) {
    throw new Error(
      `Translation request failed: ${res.status} ${res.statusText}`,
    );
  }

  const result: VolcTranslateResponse = await res.json();
  return result;
}

/**
 * 生成签名
 */
function sign(params: SignParams): string {
  const {
    headers = {},
    query = {},
    region = '',
    serviceName = '',
    method = '',
    pathName = '/',
    accessKeyId = '',
    secretAccessKey = '',
    needSignHeaderKeys = [],
    bodySha,
  } = params;
  const datetime = headers['X-Date'];
  const date = datetime.substring(0, 8); // YYYYMMDD
  // 创建正规化请求
  const [signedHeaders, canonicalHeaders] = getSignHeaders(
    headers,
    needSignHeaderKeys,
  );
  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || '',
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha || hash(''),
  ].join('\n');
  const credentialScope = [date, region, serviceName, 'request'].join('/');
  // 创建签名字符串
  const stringToSign = [
    'HMAC-SHA256',
    datetime,
    credentialScope,
    hash(canonicalRequest),
  ].join('\n');
  // 计算签名
  const kDate = hmac(secretAccessKey, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, 'request');
  const signature = hmac(kSigning, stringToSign).toString('hex');
  debuglog(
    '--------CanonicalString:\n%s\n--------SignString:\n%s',
    canonicalRequest,
    stringToSign,
  );

  return [
    'HMAC-SHA256',
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`,
  ].join(' ');
}

/**
 * HMAC-SHA256 加密
 */
function hmac(secret: string | Buffer, s: string): Buffer {
  return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

/**
 * SHA256 哈希
 */
function hash(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

/**
 * 查询参数转字符串
 */
function queryParamsToString(params: QueryParams): string {
  return Object.keys(params)
    .sort()
    .map(key => {
      const val = params[key];
      if (typeof val === 'undefined' || val === null) {
        return undefined;
      }
      const escapedKey = uriEscape(key);
      if (!escapedKey) {
        return undefined;
      }
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
      }
      return `${escapedKey}=${uriEscape(val)}`;
    })
    .filter(v => v)
    .join('&');
}

/**
 * 获取签名头
 */
function getSignHeaders(
  originHeaders: Headers,
  needSignHeaders: string[],
): [string, string] {
  function trimHeaderValue(header: string): string {
    return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
  }

  let h = Object.keys(originHeaders);
  // 根据 needSignHeaders 过滤
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set(
      [...needSignHeaders, 'x-date', 'host'].map(k => k.toLowerCase()),
    );
    h = h.filter(k => needSignSet.has(k.toLowerCase()));
  }
  // 根据 ignore headers 过滤
  h = h.filter(k => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
  const signedHeaderKeys = h
    .slice()
    .map(k => k.toLowerCase())
    .sort()
    .join(';');
  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map(k => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join('\n');
  return [signedHeaderKeys, canonicalHeaders];
}

/**
 * URI 转义
 */
function uriEscape(str: string): string {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, match =>
        match
          .split('')
          .map(c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
          .join(''),
      )
      .replace(/[*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch (e) {
    return '';
  }
}

/**
 * 获取当前时间格式化字符串
 */
export function getDateTimeNow(): string {
  const now = new Date();
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

/**
 * 获取 body 的 SHA256 值
 */
export function getBodySha(body: string | URLSearchParams | Buffer): string {
  const hashInstance = crypto.createHash('sha256');
  if (typeof body === 'string') {
    hashInstance.update(body);
  } else if (body instanceof URLSearchParams) {
    hashInstance.update(body.toString());
  } else if (Buffer.isBuffer(body)) {
    hashInstance.update(body);
  }
  return hashInstance.digest('hex');
}
