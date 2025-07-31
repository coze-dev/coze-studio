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

import { describe, it, expect } from 'vitest';
import { type ExpressionEditorParseData } from '../type';
import { ExpressionEditorSegmentType } from '../constant';
import { ExpressionEditorParser, ExpressionEditorParserBuiltin } from '.';

describe('ExpressionEditorParserBuiltin', () => {
  it('tokenIndex', () => {
    const result = ExpressionEditorParserBuiltin.tokenOffset({
      lineContent: 'test input: {{Earth.Asia.China.Hangzhou}}',
      lineOffset: 39,
    });
    expect(result).toEqual({
      lastStartTokenOffset: 13,
      firstEndTokenOffset: 39,
    });
  });
  it('extractContent', () => {
    const result = ExpressionEditorParserBuiltin.extractContent({
      lineContent: 'test input: {{Earth.Asia.China.Hangzhou}}',
      lineOffset: 39,
      lastStartTokenOffset: 13,
      firstEndTokenOffset: 39,
    });
    expect(result).toEqual({
      content: 'Earth.Asia.China.Hangzhou',
      offset: 25,
    });
  });
  it('sliceReachable', () => {
    const result = ExpressionEditorParserBuiltin.sliceReachable({
      content: 'China.Hangzhou',
      offset: 6,
    });
    expect(result).toEqual({
      reachable: 'China.',
      unreachable: 'Hangzhou',
    });
  });
  describe('splitPath', () => {
    it('pure object keys', () => {
      const result = ExpressionEditorParserBuiltin.splitText(
        'Earth.Asia.China.Hangzhou',
      );
      expect(result).toEqual(['Earth', 'Asia', 'China', 'Hangzhou']);
    });
    it('pure object keys with number type', () => {
      const result = ExpressionEditorParserBuiltin.splitText(
        'Earth.Asia.China.0.Hangzhou',
      );
      expect(result).toEqual(['Earth', 'Asia', 'China', '0', 'Hangzhou']);
    });
    it('object keys and array indexes', () => {
      const result = ExpressionEditorParserBuiltin.splitText(
        'Earth.Asia.China[0].Hangzhou',
      );
      expect(result).toEqual(['Earth', 'Asia', 'China', '[0]', 'Hangzhou']);
    });
    it('object keys and individual array indexes', () => {
      const result = ExpressionEditorParserBuiltin.splitText(
        'Earth.Asia.China.[0].Hangzhou',
      );
      expect(result).toEqual(['Earth', 'Asia', 'China', '', '[0]', 'Hangzhou']);
    });
    it('continues array index', () => {
      const result =
        ExpressionEditorParserBuiltin.splitText('Hangzhou[0][0][0]');
      expect(result).toEqual(['Hangzhou[0][0]', '[0]']);
    });
    it('continues array index start with separator', () => {
      const result =
        ExpressionEditorParserBuiltin.splitText('Hangzhou.[0][0][0]');
      expect(result).toEqual(['Hangzhou', '[0][0]', '[0]']);
    });
    it('start with array index', () => {
      const result = ExpressionEditorParserBuiltin.splitText('[0].Hangzhou');
      expect(result).toEqual(['', '[0]', 'Hangzhou']);
    });
    it('object keys with empty', () => {
      const result =
        ExpressionEditorParserBuiltin.splitText('Earth...Hangzhou');
      expect(result).toEqual(['Earth', '', '', 'Hangzhou']);
    });
    it('object keys and end with empty', () => {
      const result = ExpressionEditorParserBuiltin.splitText('China.Hangzhou.');
      expect(result).toEqual(['China', 'Hangzhou', '']);
    });
    it('object keys and start with empty', () => {
      const result = ExpressionEditorParserBuiltin.splitText('.China.Hangzhou');
      expect(result).toEqual(['', 'China', 'Hangzhou']);
    });
    it('all empty', () => {
      const result = ExpressionEditorParserBuiltin.splitText('..');
      expect(result).toEqual(['', '', '']);
    });
  });
  describe('textToPath', () => {
    it('pure object keys', () => {
      const result = ExpressionEditorParserBuiltin.toSegments('China.Hangzhou');
      expect(result).toEqual([
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 0,
          objectKey: 'China',
        },
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 1,
          objectKey: 'Hangzhou',
        },
      ]);
    });
    it('pure object keys with number type', () => {
      const result =
        ExpressionEditorParserBuiltin.toSegments('China.0.Hangzhou');
      expect(result).toEqual([
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 0,
          objectKey: 'China',
        },
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 1,
          objectKey: '0',
        },
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 2,
          objectKey: 'Hangzhou',
        },
      ]);
    });
    it('object keys and array indexes', () => {
      const result =
        ExpressionEditorParserBuiltin.toSegments('China[0].Hangzhou');
      expect(result).toEqual([
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 0,
          objectKey: 'China',
        },
        {
          type: ExpressionEditorSegmentType.ArrayIndex,
          index: 1,
          arrayIndex: 0,
        },
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 2,
          objectKey: 'Hangzhou',
        },
      ]);
    });
    it('object keys and end with empty', () => {
      const result = ExpressionEditorParserBuiltin.toSegments(
        'China_Zhejiang.Hangzhou.',
      );
      expect(result).toEqual([
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 0,
          objectKey: 'China_Zhejiang',
        },
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 1,
          objectKey: 'Hangzhou',
        },
        {
          type: ExpressionEditorSegmentType.EndEmpty,
          index: 2,
        },
      ]);
    });
    it('should be undefined', () => {
      const invalidPatterns = [
        'foo..bar',
        '..',
        '.foo',
        'foo[]',
        'foo.[]',
        'foo.[0]',
        'foo[0',
        'foo[0.',
        'foo[0].{a}',
        'foo[0][0]',
        'foo[0].[0]',
        'foo.[0].[0]',
        '[]foo',
        '.[]foo',
        '[.]foo',
        '[].foo',
        '[0].foo',
        '.[0].foo',
        '{a}',
        'foo-bar',
        '😊[0]',
      ];
      invalidPatterns.forEach(pattern => {
        const result = ExpressionEditorParserBuiltin.toSegments(pattern);
        expect(result).toBeUndefined();
      });
    });
  });
});

describe('textToPath unicode', () => {
  it('pure object keys', () => {
    const result = ExpressionEditorParserBuiltin.toSegments('主题.名称');
    expect(result).toEqual([
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: '主题',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 1,
        objectKey: '名称',
      },
    ]);
  });
  it('pure object keys with number type', () => {
    const result = ExpressionEditorParserBuiltin.toSegments('主题.0.名称');
    expect(result).toEqual([
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: '主题',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 1,
        objectKey: '0',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 2,
        objectKey: '名称',
      },
    ]);
  });
  it('object keys and array indexes', () => {
    const result = ExpressionEditorParserBuiltin.toSegments('主题[0].名称');
    expect(result).toEqual([
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: '主题',
      },
      {
        type: ExpressionEditorSegmentType.ArrayIndex,
        index: 1,
        arrayIndex: 0,
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 2,
        objectKey: '名称',
      },
    ]);
  });
  it('object keys and end with empty', () => {
    const result = ExpressionEditorParserBuiltin.toSegments('主题.名称.');
    expect(result).toEqual([
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: '主题',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 1,
        objectKey: '名称',
      },
      {
        type: ExpressionEditorSegmentType.EndEmpty,
        index: 2,
      },
    ]);
  });
});

describe('ExpressionEditorParser parse should be successful', () => {
  it('parse object keys', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: 'test: {{foo.bar}}',
      lineOffset: 15,
    });
    const expected: ExpressionEditorParseData = {
      content: {
        line: 'test: {{foo.bar}}',
        inline: 'foo.bar',
        reachable: 'foo.bar',
        unreachable: '',
      },
      offset: {
        line: 15,
        inline: 7,
        lastStart: 7,
        firstEnd: 15,
      },
      segments: {
        inline: [
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 0,
            objectKey: 'foo',
          },
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 1,
            objectKey: 'bar',
          },
        ],
        reachable: [
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 0,
            objectKey: 'foo',
          },
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 1,
            objectKey: 'bar',
          },
        ],
      },
    };
    expect(result).toEqual(expected);
  });
  it('parse array indexes', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: 'test: {{foo[0].bar}}',
      lineOffset: 18,
    });
    const expected: ExpressionEditorParseData = {
      content: {
        line: 'test: {{foo[0].bar}}',
        inline: 'foo[0].bar',
        reachable: 'foo[0].bar',
        unreachable: '',
      },
      offset: {
        line: 18,
        inline: 10,
        lastStart: 7,
        firstEnd: 18,
      },
      segments: {
        inline: [
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 0,
            objectKey: 'foo',
          },
          {
            type: ExpressionEditorSegmentType.ArrayIndex,
            index: 1,
            arrayIndex: 0,
          },
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 2,
            objectKey: 'bar',
          },
        ],
        reachable: [
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 0,
            objectKey: 'foo',
          },
          {
            type: ExpressionEditorSegmentType.ArrayIndex,
            index: 1,
            arrayIndex: 0,
          },
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 2,
            objectKey: 'bar',
          },
        ],
      },
    };
    expect(result).toEqual(expected);
  });
  it('parse end with empty', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: 'test: {{foo.bar}}',
      lineOffset: 12,
    });
    const expected: ExpressionEditorParseData = {
      content: {
        line: 'test: {{foo.bar}}',
        inline: 'foo.bar',
        reachable: 'foo.',
        unreachable: 'bar',
      },
      offset: { line: 12, inline: 4, lastStart: 7, firstEnd: 15 },
      segments: {
        inline: [
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 0,
            objectKey: 'foo',
          },
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 1,
            objectKey: 'bar',
          },
        ],
        reachable: [
          {
            type: ExpressionEditorSegmentType.ObjectKey,
            index: 0,
            objectKey: 'foo',
          },
          { type: ExpressionEditorSegmentType.EndEmpty, index: 1 },
        ],
      },
    };
    expect(result).toEqual(expected);
  });
  it('empty {{content}}', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: 'test: {{}}',
      lineOffset: 8,
    });
    const expected: ExpressionEditorParseData = {
      content: {
        line: 'test: {{}}',
        inline: '',
        reachable: '',
        unreachable: '',
      },
      offset: { line: 8, inline: 0, lastStart: 7, firstEnd: 8 },
      segments: {
        inline: [{ type: ExpressionEditorSegmentType.EndEmpty, index: 0 }],
        reachable: [{ type: ExpressionEditorSegmentType.EndEmpty, index: 0 }],
      },
    };
    expect(result).toEqual(expected);
  });
  it('only empty {{content}}', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: '{{}}',
      lineOffset: 2,
    });
    const expected: ExpressionEditorParseData = {
      content: { line: '{{}}', inline: '', reachable: '', unreachable: '' },
      offset: { line: 2, inline: 0, lastStart: 1, firstEnd: 2 },
      segments: {
        inline: [{ type: ExpressionEditorSegmentType.EndEmpty, index: 0 }],
        reachable: [{ type: ExpressionEditorSegmentType.EndEmpty, index: 0 }],
      },
    };
    expect(result).toEqual(expected);
  });
});

describe('ExpressionEditorParser parse should be fail', () => {
  it('out of bucket', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: 'test: {{foo.bar}}',
      lineOffset: 7,
    });
    expect(result).toBeUndefined();
  });
  it('dangling null pointer', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: '{{foo.bar}}',
      lineOffset: 12,
    });
    expect(result).toBeUndefined();
  });
  it('empty content with not zero offset', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: '',
      lineOffset: 1,
    });
    expect(result).toBeUndefined();
  });
  it('invalid char', () => {
    const result = ExpressionEditorParser.parse({
      lineContent: '{{foo(0).bar}}',
      lineOffset: 12,
    });
    expect(result).toBeUndefined();
  });
});
