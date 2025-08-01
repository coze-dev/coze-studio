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

/**
 * @deprecated use query-string or URLSearchParams instead
 * @param queryString query or hash string
 * @returns key value pair as the parse result, if a key show up more than ones in query, the last value will be taken
 */
export const parseHashOrQuery = (queryString: string) => {
  if (queryString.startsWith('?') || queryString.startsWith('#')) {
    queryString = queryString.slice(1);
  }

  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};
