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

export const TEST_RUN_FILE_NAME_KEY = 'x-wf-file_name';
export const TEST_RUN_FILE_UPLOADING_KEY = 'x-wf-file_uploading';

export const getFileInfo = (formatUrl: string) => {
  const url = new URL(formatUrl);
  const params = new URLSearchParams(url.search);
  const fileName = params.get(TEST_RUN_FILE_NAME_KEY) ?? '';
  const uploading = params.get(TEST_RUN_FILE_UPLOADING_KEY);

  return {
    url: formatUrl,
    name: fileName,
    uploading,
  };
};

export const getUrlWithFilename = (url: string, name?: string) => {
  if (!name || !url) {
    return url;
  }
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (params.has(TEST_RUN_FILE_NAME_KEY)) {
      params.set(TEST_RUN_FILE_NAME_KEY, name);
    } else {
      params.append(TEST_RUN_FILE_NAME_KEY, name);
    }

    urlObj.search = params.toString();

    return urlObj.toString();
  } catch (e) {
    return url;
  }
};
