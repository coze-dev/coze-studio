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
 
/* eslint-disable @typescript-eslint/no-namespace */

import type {
  ExpressionEditorParseData,
  ExpressionEditorSegment,
} from '../type';
import {
  ExpressionEditorSegmentType,
  ExpressionEditorToken,
} from '../constant';

export namespace ExpressionEditorParserBuiltin {
  /** 计算开始和结束标识的序号 */
  export const tokenOffset = (line: {
    lineContent: string;
    lineOffset: number;
  }):
    | {
        lastStartTokenOffset: number;
        firstEndTokenOffset: number;
      }
    | undefined => {
    const { lineContent: content, lineOffset: offset } = line;

    const firstEndTokenOffset = content.indexOf(
      ExpressionEditorToken.End,
      offset,
    );

    const endChars = content.slice(
      firstEndTokenOffset,
      // eslint-disable-next-line no-magic-numbers
      firstEndTokenOffset + 2,
    );
    if (endChars !== ExpressionEditorToken.FullEnd) {
      // 结束符号 "}}" 不完整
      return;
    }
    const lastStartTokenOffset = content.lastIndexOf(
      ExpressionEditorToken.Start,
      offset - 1,
    );
    const startChars = content.slice(
      lastStartTokenOffset - 1,
      lastStartTokenOffset + 1,
    );
    if (startChars !== ExpressionEditorToken.FullStart) {
      // 开始符号 "{{" 不完整
      return;
    }
    return {
      lastStartTokenOffset,
      firstEndTokenOffset,
    };
  };

  /** 从行内容提取内容 */
  export const extractContent = (params: {
    lineContent: string;
    lineOffset: number;
    lastStartTokenOffset: number;
    firstEndTokenOffset: number;
  }):
    | {
        content: string;
        offset: number;
      }
    | undefined => {
    const {
      lineContent,
      lineOffset,
      lastStartTokenOffset,
      firstEndTokenOffset,
    } = params;
    const content = lineContent.slice(
      lastStartTokenOffset + 1,
      firstEndTokenOffset,
    );
    const offset = lineOffset - lastStartTokenOffset - 1;
    return {
      content,
      offset,
    };
  };

  /** 根据 offset 将文本内容切分为可用与不可用 */
  export const sliceReachable = (params: {
    content: string;
    offset: number;
  }): {
    reachable: string;
    unreachable: string;
  } => {
    const { content, offset } = params;
    const reachable = content.slice(0, offset);
    const unreachable = content.slice(offset, content.length);
    return {
      reachable,
      unreachable,
    };
  };

  /** 切分文本 */
  export const splitText = (pathString: string): string[] => {
    // 得到的分割数组，初始为原字符串以"."分割的结果
    const segments = pathString.split(ExpressionEditorToken.Separator);

    // 定义结果数组，并处理连续的"."导致的空字符串
    const result: string[] = [];

    segments.forEach(segment => {
      if (!segment.match(/\[\d+\]/)) {
        // 如果不是数组索引，直接加入结果数组，即使是空字符串也加入以保持正确的分割
        result.push(segment);
        return;
      }
      // 如果当前段是数组索引，将前面的字符串和当前数组索引分别加入结果数组
      const lastSegmentIndex = segment.lastIndexOf(
        ExpressionEditorToken.ArrayStart,
      );
      const key = segment.substring(0, lastSegmentIndex);
      const index = segment.substring(lastSegmentIndex);
      // {{array[0]}} 中的 array
      result.push(key);
      // {{array[0]}} 中的 [0]
      result.push(index);
      return;
    });

    return result;
  };

  /** 字符串解析为路径 */
  export const toSegments = (
    text: string,
  ): ExpressionEditorSegment[] | undefined => {
    const textSegments = ExpressionEditorParserBuiltin.splitText(text);
    const segments: ExpressionEditorSegment[] = [];
    const validate = textSegments.every((textSegment, index) => {
      // 数组下标
      if (
        textSegment.startsWith(ExpressionEditorToken.ArrayStart) &&
        textSegment.endsWith(ExpressionEditorToken.ArrayEnd)
      ) {
        const arrayIndexString = textSegment.slice(1, -1);
        const arrayIndex = Number(arrayIndexString);
        if (arrayIndexString === '' || Number.isNaN(arrayIndex)) {
          // index 必须是数字
          return false;
        }
        const lastSegment = segments[segments.length - 1];
        if (
          !lastSegment ||
          lastSegment.type !== ExpressionEditorSegmentType.ObjectKey
        ) {
          // 数组索引必须在 key 之后
          return false;
        }
        segments.push({
          type: ExpressionEditorSegmentType.ArrayIndex,
          index,
          arrayIndex,
        });
      }
      // 最后一行空文本
      else if (index === textSegments.length - 1 && textSegment === '') {
        segments.push({
          type: ExpressionEditorSegmentType.EndEmpty,
          index,
        });
      } else {
        if (!textSegment || !/^[\u4e00-\u9fa5_a-zA-Z0-9]*$/.test(textSegment)) {
          return false;
        }
        segments.push({
          type: ExpressionEditorSegmentType.ObjectKey,
          index,
          objectKey: textSegment,
        });
      }
      return true;
    });
    if (!validate) {
      return undefined;
    }
    return segments;
  };
}

export namespace ExpressionEditorParser {
  export const parse = (line: {
    lineContent: string;
    lineOffset: number;
  }): ExpressionEditorParseData | undefined => {
    const { lineContent, lineOffset } = line;
    const tokenOffsets = ExpressionEditorParserBuiltin.tokenOffset(line);
    if (!tokenOffsets) {
      return;
    }
    const { lastStartTokenOffset, firstEndTokenOffset } = tokenOffsets;
    const extractedContent = ExpressionEditorParserBuiltin.extractContent({
      ...line,
      ...tokenOffsets,
    });
    if (!extractedContent) {
      return;
    }
    const { content, offset } = extractedContent;
    const slicedReachable =
      ExpressionEditorParserBuiltin.sliceReachable(extractedContent);
    if (!slicedReachable) {
      return;
    }
    const reachableSegments = ExpressionEditorParserBuiltin.toSegments(
      slicedReachable.reachable,
    );
    const inlineSegments = ExpressionEditorParserBuiltin.toSegments(content);
    if (!reachableSegments) {
      return;
    }
    return {
      content: {
        line: lineContent,
        inline: content,
        reachable: slicedReachable.reachable,
        unreachable: slicedReachable.unreachable,
      },
      offset: {
        line: lineOffset,
        inline: offset,
        lastStart: lastStartTokenOffset,
        firstEnd: firstEndTokenOffset,
      },
      segments: {
        inline: inlineSegments,
        reachable: reachableSegments,
      },
    };
  };
}
