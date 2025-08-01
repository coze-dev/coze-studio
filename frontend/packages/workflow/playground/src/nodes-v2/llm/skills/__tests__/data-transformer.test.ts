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

import { describe, expect, it } from 'vitest';

import {
  formatFcParamOnInit,
  formatFcParamOnSubmit,
} from '../data-transformer';

describe('data-transformer', () => {
  it('formatFcParamOnInit with undefined', () => {
    expect(formatFcParamOnInit(undefined)).toEqual(undefined);
  });

  it('formatFcParamOnInit with search_strategy', () => {
    expect(
      formatFcParamOnInit({
        knowledgeFCParam: {
          global_setting: {
            search_strategy: 20,
            min_score: 0.5,
            top_k: 3,
            auto: false,
            show_source: false,
            use_rerank: true,
            use_rewrite: true,
            use_nl2_sql: true,
          },
        },
      }),
    ).toEqual({
      knowledgeFCParam: {
        global_setting: {
          search_strategy: 20,
          min_score: 0.5,
          top_k: 3,
          auto: false,
          show_source: false,
          use_rerank: true,
          use_rewrite: true,
          use_nl2_sql: true,
        },
      },
    });
  });

  it('formatFcParamOnInit with search_mode', () => {
    expect(
      formatFcParamOnInit({
        knowledgeFCParam: {
          global_setting: {
            search_mode: 20,
            min_score: 0.5,
            top_k: 3,
            auto: false,
            show_source: false,
            use_rerank: true,
            use_rewrite: true,
            use_nl2_sql: true,
          },
        },
      }),
    ).toEqual({
      knowledgeFCParam: {
        global_setting: {
          search_strategy: 20,
          min_score: 0.5,
          top_k: 3,
          auto: false,
          show_source: false,
          use_rerank: true,
          use_rewrite: true,
          use_nl2_sql: true,
        },
      },
    });
  });

  it('formatFcParamOnSubmit with undefined', () => {
    expect(formatFcParamOnSubmit(undefined)).toEqual(undefined);
  });

  it('formatFcParamOnSubmit with search_strategy', () => {
    expect(
      formatFcParamOnSubmit({
        knowledgeFCParam: {
          global_setting: {
            search_strategy: 20,
            min_score: 0.5,
            top_k: 3,
            auto: false,
            show_source: false,
            use_rerank: true,
            use_rewrite: true,
            use_nl2_sql: true,
          },
        },
      }),
    ).toEqual({
      knowledgeFCParam: {
        global_setting: {
          search_mode: 20,
          min_score: 0.5,
          top_k: 3,
          auto: false,
          show_source: false,
          use_rerank: true,
          use_rewrite: true,
          use_nl2_sql: true,
        },
      },
    });
  });
});
