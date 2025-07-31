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

/** reserved query parameters */
const PRESERVED_SEARCH_PARAMS = ['commit_version'];

/**
 * Add specific search params to the specified URL
 * @param url current url
 * @returns
 */
export function addPreservedSearchParams(url: string) {
  if (!url) {
    return url;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const newSearchParams = new URLSearchParams();

  for (const param of PRESERVED_SEARCH_PARAMS) {
    const value = searchParams.get(param);
    if (value && !url.includes(`${param}=`)) {
      newSearchParams.append(param, value);
    }
  }

  const separator = url.includes('?') ? '&' : '?';
  const qs = newSearchParams.toString();
  return qs ? `${url}${separator}${qs}` : url;
}
