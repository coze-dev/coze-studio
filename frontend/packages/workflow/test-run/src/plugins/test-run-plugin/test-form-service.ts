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

import { injectable } from 'inversify';
import { useService } from '@flowgram-adapter/free-layout-editor';

export type FormDataType = any;

export const TestFormService = Symbol('TestFormService');

export interface TestFormService {
  /** form cache value */
  cacheValues: Map<string, FormDataType>;

  getCacheValues: (id: string) => null | FormDataType;
  setCacheValues: (id: string, value: FormDataType) => void;
}

@injectable()
export class TestFormServiceImpl implements TestFormService {
  cacheValues = new Map();
  getCacheValues(id: string) {
    return this.cacheValues.get(id) || null;
  }
  setCacheValues(id: string, value: FormDataType) {
    this.cacheValues.set(id, value);
  }
}

export const useTestFormService = () =>
  useService<TestFormService>(TestFormService);
