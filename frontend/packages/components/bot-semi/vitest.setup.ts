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

// Mock CSS modules for Node environment
const mockCssModules = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return `mock-${prop}`;
      }
      return target[prop];
    },
  },
);

// Mock all .module.less imports
interface GlobalWithCSSModules {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __CSS_MODULES__: typeof mockCssModules;
}

(global as unknown as GlobalWithCSSModules).__CSS_MODULES__ = mockCssModules;
