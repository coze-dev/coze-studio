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

const DOMAIN_REGEXP = /^([0-9a-zA-Z-]{1,}\.)+([a-zA-Z]{2,})$/;

export function isValidUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    return (
      DOMAIN_REGEXP.test(urlObject.hostname) &&
      // cp-disable-next-line
      (url.indexOf('https://') !== -1 || url.indexOf('http://') !== -1)
    );
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need to throw error according to function function
  } catch {
    return false;
  }
}

export function completeUrl(url: string): string {
  let newUrl = url.trim();

  if (!newUrl.includes('://')) {
    // cp-disable-next-line
    newUrl = `http://${newUrl}`;
  }

  return newUrl;
}
