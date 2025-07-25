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
 
import { URI } from '@coze-project-ide/client';

import { URI_SCHEME } from '../constants';

/**
 * 从给定的 url 字符串中解析出 resourceType 和 resourceId;
 */
export const getResourceByPathname = (pathname: string) => {
  let resourceType: undefined | string;
  let resourceId: undefined | string;

  const regex = /space\/\d+\/project-ide\/\d+\/([^\/]+)(?:\/([^\/]+))?/;
  const match = pathname.match(regex);

  if (match) {
    resourceType = match[1];
    resourceId = match[2];
  }

  return {
    resourceType,
    resourceId,
  };
};

export const getURIPathByPathname = (pathname: string) => {
  const match = pathname.match(/space\/[^/]+\/project-ide\/[^/]+\/(.*)/);
  return match ? match[1] : null;
};

/**
 * 从 uri 上解析 resourceType 和 resourceId
 */
export const getResourceByURI = (uri: URI) => {
  /**
   * TODO: 这样解析有些粗暴了，后面要调整一下
   */
  const resourceType = uri.path.dir.base;
  const resourceId = uri.path.base;

  return {
    resourceType,
    resourceId,
  };
};

export const getPathnameByURI = (uri: URI) => uri.path.toString();

/**
 * 根据 resourceType 和 resourceId 生成 URI
 */
export const getURIByResource = (
  resourceType: string,
  resourceId: string,
  query?: string,
) =>
  new URI(
    `${URI_SCHEME}:///${resourceType}/${resourceId}${query ? `?${query}` : ''}`,
  );

export const getURIByPath = (path: string) =>
  new URI(`${URI_SCHEME}:///${path}`);

/**
 * 将 uri 转化为 url
 */
export const getURLByURI = (uri: URI) =>
  `${uri.path.toString()}${uri.query ? `${uri.query}` : ''}${
    uri.fragment ? `#${uri.fragment}` : ''
  }`;

/**
 * 执行 URI 比对，完全一致返回 true，否则返回 false
 */
export const compareURI = (uri1?: URI, uri2?: URI) => {
  if (!uri1 || !uri2) {
    return false;
  }
  return uri1.toString() === uri2.toString();
};
