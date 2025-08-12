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

export const fetchResource = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

export const downloadFile = (blob: Blob, filename?: string) => {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = downloadUrl;
  link.setAttribute('download', filename || 'document');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
