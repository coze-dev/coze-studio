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

import queryString from 'query-string';

import { getIsMobile, getIsSafari } from './platform';

export const getParamsFromQuery = (params: { key: string }) => {
  const { key = '' } = params;
  const queryParams = queryString.parse(location.search);
  return (queryParams?.[key] ?? '') as string;
};
export function appendUrlParam(
  url: string,
  key: string,
  value: string | string[] | null | undefined,
) {
  const urlInfo = queryString.parseUrl(url);
  if (!value) {
    delete urlInfo.query[key];
  } else {
    urlInfo.query[key] = value;
  }
  return queryString.stringifyUrl(urlInfo);
}

export function openUrl(url?: string) {
  if (!url) {
    return;
  }
  if (getIsMobile() && getIsSafari()) {
    location.href = url;
  } else {
    window.open(url, '_blank');
  }
}
