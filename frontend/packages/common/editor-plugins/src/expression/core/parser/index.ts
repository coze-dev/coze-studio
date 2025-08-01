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
  /** Calculate the serial number of the start and end tags */
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
      // End symbol "}}" is incomplete
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
      // The opening symbol "{{" is incomplete
      return;
    }
    return {
      lastStartTokenOffset,
      firstEndTokenOffset,
    };
  };

  /** Extract content from line content */
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

  /** Split text content into available and unavailable by offset */
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

  /** Split text */
  export const splitText = (pathString: string): string[] => {
    // The obtained split array, initially the result of splitting the original string with "."
    const segments = pathString.split(ExpressionEditorToken.Separator);

    // Define the result array and handle empty strings resulting from consecutive "."
    const result: string[] = [];

    segments.forEach(segment => {
      if (!segment.match(/\[\d+\]/)) {
        // If it is not an array index, add the result array directly, even if it is an empty string, to maintain the correct segmentation
        result.push(segment);
        return;
      }
      // If the current segment is an array index, add the previous string and the current array index to the result array, respectively
      const lastSegmentIndex = segment.lastIndexOf(
        ExpressionEditorToken.ArrayStart,
      );
      const key = segment.substring(0, lastSegmentIndex);
      const index = segment.substring(lastSegmentIndex);
      // Array in {{array [0]}}
      result.push(key);
      // [0] in {{array [0]}}
      result.push(index);
      return;
    });

    return result;
  };

  /** String parsed as path */
  export const toSegments = (
    text: string,
  ): ExpressionEditorSegment[] | undefined => {
    const textSegments = ExpressionEditorParserBuiltin.splitText(text);
    const segments: ExpressionEditorSegment[] = [];
    const validate = textSegments.every((textSegment, index) => {
      // array subscript
      if (
        textSegment.startsWith(ExpressionEditorToken.ArrayStart) &&
        textSegment.endsWith(ExpressionEditorToken.ArrayEnd)
      ) {
        const arrayIndexString = textSegment.slice(1, -1);
        const arrayIndex = Number(arrayIndexString);
        if (arrayIndexString === '' || Number.isNaN(arrayIndex)) {
          // Index must be a number
          return false;
        }
        const lastSegment = segments[segments.length - 1];
        if (
          !lastSegment ||
          lastSegment.type !== ExpressionEditorSegmentType.ObjectKey
        ) {
          // The array index must be after the key
          return false;
        }
        segments.push({
          type: ExpressionEditorSegmentType.ArrayIndex,
          index,
          arrayIndex,
        });
      }
      // The last empty line of text
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
