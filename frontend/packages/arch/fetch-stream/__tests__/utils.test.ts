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

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  onStart,
  validateChunk,
  isFetchStreamErrorInfo,
  getStreamingErrorInfo,
  getFetchErrorInfo,
  isAbortError,
} from '../src/utils';
import { FetchStreamErrorCode } from '../src/type';

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onStart', () => {
    it('应该调用 inputOnStart 函数', async () => {
      const inputOnStart = vi.fn().mockResolvedValue(undefined);
      const mockResponse = {
        ok: true,
        body: new ReadableStream(),
        status: 200,
      } as Response;

      await onStart(mockResponse, inputOnStart);

      expect(inputOnStart).toHaveBeenCalledWith(mockResponse);
    });

    it('当 response.ok 为 false 时应该抛出错误', async () => {
      const mockResponse = {
        ok: false,
        body: new ReadableStream(),
        status: 500,
      } as Response;

      await expect(onStart(mockResponse, undefined)).rejects.toThrow(
        'Invalid Response, ResponseStatus: 500',
      );
    });

    it('当 response.body 为 null 时应该抛出错误', async () => {
      const mockResponse = {
        ok: true,
        body: null,
        status: 200,
      } as Response;

      await expect(onStart(mockResponse, undefined)).rejects.toThrow(
        'Invalid Response, ResponseStatus: 200',
      );
    });

    it('当 inputOnStart 抛出错误时应该传播错误', async () => {
      const inputOnStart = vi.fn().mockRejectedValue(new Error('Custom error'));
      const mockResponse = {
        ok: true,
        body: new ReadableStream(),
        status: 200,
      } as Response;

      await expect(onStart(mockResponse, inputOnStart)).rejects.toThrow(
        'Custom error',
      );
    });
  });

  describe('validateChunk', () => {
    it('应该成功验证正常的文本块', () => {
      expect(() => validateChunk('normal text')).not.toThrow();
    });

    it('应该成功验证包含 code: 0 的 JSON', () => {
      const chunk = JSON.stringify({ code: 0, msg: 'success' });
      expect(() => validateChunk(chunk)).not.toThrow();
    });

    it('应该抛出包含非零 code 的 JSON 对象', () => {
      const errorObj = { code: 400, msg: 'Bad Request' };
      const chunk = JSON.stringify(errorObj);

      expect(() => validateChunk(chunk)).toThrow();
    });

    it('应该成功处理无效的 JSON', () => {
      expect(() => validateChunk('invalid json {')).not.toThrow();
    });

    it('应该成功处理非对象的 JSON', () => {
      expect(() => validateChunk('"string"')).not.toThrow();
      expect(() => validateChunk('123')).not.toThrow();
      expect(() => validateChunk('true')).not.toThrow();
    });

    it('应该成功处理没有 code 字段的对象', () => {
      const chunk = JSON.stringify({ msg: 'no code field' });
      expect(() => validateChunk(chunk)).not.toThrow();
    });
  });

  describe('isFetchStreamErrorInfo', () => {
    it('应该识别有效的 FetchStreamErrorInfo', () => {
      const errorInfo = { code: 400, msg: 'Error message' };
      expect(isFetchStreamErrorInfo(errorInfo)).toBe(true);
    });

    it('应该拒绝缺少 code 字段的对象', () => {
      const obj = { msg: 'Error message' };
      expect(isFetchStreamErrorInfo(obj)).toBe(false);
    });

    it('应该拒绝缺少 msg 字段的对象', () => {
      const obj = { code: 400 };
      expect(isFetchStreamErrorInfo(obj)).toBe(false);
    });

    it('应该拒绝非对象值', () => {
      expect(isFetchStreamErrorInfo(null)).toBe(false);
      expect(isFetchStreamErrorInfo(undefined)).toBe(false);
      expect(isFetchStreamErrorInfo('string')).toBe(false);
      expect(isFetchStreamErrorInfo(123)).toBe(false);
    });
  });

  describe('getStreamingErrorInfo', () => {
    it('应该从 Error 对象中提取消息', () => {
      const error = new Error('Test error message');
      const result = getStreamingErrorInfo(error);

      expect(result).toEqual({
        msg: 'Test error message',
        code: FetchStreamErrorCode.HttpChunkStreamingException,
        error,
      });
    });

    it('应该从 FetchStreamErrorInfo 对象中提取信息', () => {
      const errorInfo = { code: 400, msg: 'Custom error' };
      const result = getStreamingErrorInfo(errorInfo);

      expect(result).toEqual({
        msg: 'Custom error',
        code: 400,
        error: errorInfo,
      });
    });

    it('应该处理未知错误类型', () => {
      const error = 'string error';
      const result = getStreamingErrorInfo(error);

      expect(result).toEqual({
        msg: 'An exception occurred during the process of dealing with HTTP chunked streaming response.',
        code: FetchStreamErrorCode.HttpChunkStreamingException,
        error,
      });
    });
  });

  describe('getFetchErrorInfo', () => {
    it('应该从 Error 对象中提取消息', () => {
      const error = new Error('Fetch failed');
      const result = getFetchErrorInfo(error);

      expect(result).toEqual({
        msg: 'Fetch failed',
        code: FetchStreamErrorCode.FetchException,
        error,
      });
    });

    it('应该处理非 Error 对象', () => {
      const error = 'fetch error';
      const result = getFetchErrorInfo(error);

      expect(result).toEqual({
        msg: 'An exception occurred during the fetch',
        code: FetchStreamErrorCode.FetchException,
        error,
      });
    });
  });

  describe('isAbortError', () => {
    it('应该识别 AbortError', () => {
      const abortError = new DOMException(
        'The operation was aborted',
        'AbortError',
      );
      expect(isAbortError(abortError)).toBe(true);
    });

    it('应该拒绝其他 DOMException', () => {
      const otherError = new DOMException('Other error', 'OtherError');
      expect(isAbortError(otherError)).toBe(false);
    });

    it('应该拒绝普通 Error', () => {
      const error = new Error('Normal error');
      expect(isAbortError(error)).toBe(false);
    });

    it('应该拒绝非错误对象', () => {
      expect(isAbortError('string')).toBe(false);
      expect(isAbortError(null)).toBe(false);
      expect(isAbortError(undefined)).toBe(false);
    });
  });
});
