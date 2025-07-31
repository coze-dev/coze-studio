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

import { type IPlugin } from '@coze-arch/idl2ts-generator';

export interface ApiConfig {
  // IDL entrance
  entries: Record<string, string>;
  // IDL root directory
  idlRoot: string;
  // service alias
  // Custom API method
  commonCodePath: string;
  // API Product Catalog
  output: string;
  // Warehouse information settings
  repository?: {
    // Warehouse address
    url: string;
    // Clone to local location
    dest: string;
  };
  // plugin
  plugins?: IPlugin[];
  // aggregate exported filename
  aggregationExport?: string;
  // Format file
  formatter: (name: string, content: string) => string;
  idlFetchConfig?: {
    source: string;
    branch?: string;
    commit?: string;
    rootDir?: string;
  };
}

export interface ApiTypeConfig extends ApiConfig {
  // Methods that require filtering
  filters: Record<string, string[]>;
}
