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
 * signature parameter interface
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
 * query parameter type
 */
export type QueryParams = Record<string, string | string[] | undefined | null>;

/**
 * request header type
 */
export type Headers = Record<string, string>;

/**
 * translation request parameter interface
 */
export interface TranslateRequest {
  /** source language code */
  SourceLanguage: string;
  /** target language code */
  TargetLanguage: string;
  /** List of texts to be translated */
  TextList: string[];
}

/**
 * Additional information in the translation results
 */
export interface TranslationExtra {
  /** Number of characters entered */
  input_characters: string;
  /** source language */
  source_language: string;
}

/**
 * Single translation result
 */
export interface TranslationItem {
  /** translation result */
  Translation: string;
  /** Detected source language */
  DetectedSourceLanguage: string;
  /** Additional information */
  Extra: TranslationExtra;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  /** Request ID */
  RequestId: string;
  /** operation name */
  Action: string;
  /** API version */
  Version: string;
  /** service name */
  Service: string;
  /** area */
  Region: string;
}

/**
 * Volcano Engine Translation API Response Interface
 */
export interface VolcTranslateResponse {
  /** List of translation results */
  TranslationList: TranslationItem[];
  /** Response metadata */
  ResponseMetadata: ResponseMetadata;
  /** Response metadata (alternate field) */
  ResponseMetaData?: ResponseMetadata;
}

/**
 * translation configuration parameters
 */
export interface TranslateConfig {
  /** Access Key ID */
  accessKeyId: string;
  /** secret access key */
  secretAccessKey: string;
  /** service area */
  region?: string;
  /** source language code */
  sourceLanguage?: string;
  /** target language code */
  targetLanguage?: string;
}

/**
 * Header key that does not participate in the signature process
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
 * Volcano Engine Translation Interface
 * @Param textArray Array of text to translate
 * @Param config Translate configuration parameters, use default configuration if not provided
 * @Returns translation response result
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
      // The x-date header is required
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

  // Normalize the query object to prevent the query value from being undefined after serialization
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
 * generate signature
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
  // Create a regularization request
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
  // Create signature string
  const stringToSign = [
    'HMAC-SHA256',
    datetime,
    credentialScope,
    hash(canonicalRequest),
  ].join('\n');
  // Compute signature
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
 * HMAC-SHA256 encryption
 */
function hmac(secret: string | Buffer, s: string): Buffer {
  return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

/**
 * SHA256 hash
 */
function hash(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

/**
 * Query parameter to string
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
        return `${escapedKey}=${val
          .map(uriEscape)
          .sort()
          .join(`&${escapedKey}=`)}`;
      }
      return `${escapedKey}=${uriEscape(val)}`;
    })
    .filter(v => v)
    .join('&');
}

/**
 * Get signature header
 */
function getSignHeaders(
  originHeaders: Headers,
  needSignHeaders: string[],
): [string, string] {
  function trimHeaderValue(header: string): string {
    return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
  }

  let h = Object.keys(originHeaders);
  // Filter by needSignHeaders
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set(
      [...needSignHeaders, 'x-date', 'host'].map(k => k.toLowerCase()),
    );
    h = h.filter(k => needSignSet.has(k.toLowerCase()));
  }
  // Filter by ignoring headers
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
 * URI escape
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
 * Get the current time format string
 */
export function getDateTimeNow(): string {
  const now = new Date();
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

/**
 * Get the SHA256 value of the body
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
