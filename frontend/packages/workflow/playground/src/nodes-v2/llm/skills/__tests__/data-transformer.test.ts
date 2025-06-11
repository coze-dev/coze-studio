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
