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

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './namespaces/base';
import * as table_base from './namespaces/table_base';
import * as table_import from './namespaces/table_import';
export { base, table_base, table_import };
export * from './namespaces/base';
export * from './namespaces/table_base';
export * from './namespaces/table_import';

export type Int64 = string | number;

export default class DatamodelService<T> {
  private request: any = () => {
    throw new Error('DatamodelService.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || '';
  }

  private genBaseURL(path: string) {
    return typeof this.baseURL === 'string'
      ? this.baseURL + path
      : this.baseURL(path);
  }

  /**
   * POST /api/datamodel/tablefile/preview
   *
   * [jump to BAM]()
   *
   * [Table Import] Import file data pre-check
   */
  PreviewTableFile(
    req: table_import.PreviewTableFileRequest,
    options?: T,
  ): Promise<table_import.PreviewTableFileResponse> {
    const url = this.genBaseURL('/api/datamodel/tablefile/preview');
    const method = 'POST';
    const _req = req || {};
    const data = {
      table: _req['table'],
      file: _req['file'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/datamodel/tablefiletask/query
   *
   * [jump to BAM]()
   *
   * [Table Import] Import file data task information query
   */
  QueryTableFileTaskStatus(
    req: table_import.QueryTableFileTaskStatusRequest,
    options?: T,
  ): Promise<table_import.QueryTableFileTaskStatusResponse> {
    const url = this.genBaseURL('/api/datamodel/tablefiletask/query');
    const method = 'POST';
    const _req = req || {};
    const data = {
      table_id: _req['table_id'],
      bot_id: _req['bot_id'],
      task_id: _req['task_id'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/datamodel/table/add
   *
   * [jump to BAM]()
   *
   * [Table Import] Import file Add table
   */
  AddTable(
    req: table_import.AddTableRequest,
    options?: T,
  ): Promise<table_import.AddTableResponse> {
    const url = this.genBaseURL('/api/datamodel/table/add');
    const method = 'POST';
    const _req = req || {};
    const data = {
      table: _req['table'],
      file: _req['file'],
      rw_mode: _req['rw_mode'],
      Base: _req['Base'],
    };
    return this.request({ url, method, data }, options);
  }
}
/* eslint-enable */
