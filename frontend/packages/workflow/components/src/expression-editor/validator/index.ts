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
/* eslint-disable no-cond-assign */
import { Node } from 'slate';

import type {
  ExpressionEditorLine,
  ExpressionEditorTreeNode,
  ExpressionEditorValidateData,
} from '../type';
import { ExpressionEditorTreeHelper } from '../tree-helper';
import { ExpressionEditorParserBuiltin } from '../parser';
import { ExpressionEditorSegmentType } from '../constant';

export namespace ExpressionEditorValidator {
  interface ExpressionEditorPattern {
    start: number;
    end: number;
    content: string;
  }
  export const findPatterns = (text: string): ExpressionEditorPattern[] => {
    const matches: ExpressionEditorPattern[] = [];
    const regex = /{{(.*?)}}/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start: number = match.index;
      const end: number = regex.lastIndex;
      const content: string = match[1];
      matches.push({ start, end, content });
    }
    return matches;
  };
  const patternValidate = (params: {
    pattern: ExpressionEditorPattern;
    tree: ExpressionEditorTreeNode[];
  }) => {
    const { pattern, tree } = params;
    // 1. content to segments
    const segments = ExpressionEditorParserBuiltin.toSegments(pattern.content);
    if (!segments) {
      return {
        start: pattern.start,
        end: pattern.end,
        valid: false,
        message: 'invalid variable path',
      };
    }
    if (
      segments[segments.length - 1].type ===
      ExpressionEditorSegmentType.EndEmpty
    ) {
      return {
        start: pattern.start,
        end: pattern.end,
        valid: false,
        message: 'empty with empty',
      };
    }
    // 2. segments mix variable tree, match tree branch
    const treeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
      tree,
      segments,
    });
    if (!treeBranch) {
      return {
        start: pattern.start,
        end: pattern.end,
        valid: false,
        message: 'no match variable path',
      };
    }
    // 3. if full segments path could match one tree branch, the pattern is valid
    return {
      start: pattern.start,
      end: pattern.end,
      valid: true,
    };
  };
  export const lineTextValidate = (params: {
    lineText: string;
    tree: ExpressionEditorTreeNode[];
  }): ExpressionEditorValidateData[] => {
    const { lineText, tree } = params;
    // find patterns {{content}}, record start / end offset
    const patterns: ExpressionEditorPattern[] = findPatterns(lineText);
    const validateList: ExpressionEditorValidateData[] = patterns.map(pattern =>
      patternValidate({ pattern, tree }),
    );
    return validateList;
  };
  export const validate = (params: {
    lines: ExpressionEditorLine[];
    tree: ExpressionEditorTreeNode[];
  }): ExpressionEditorValidateData[] => {
    const { lines, tree } = params;
    const textLines: string[] = lines.map(n => Node.string(n));
    const validateList: ExpressionEditorValidateData[] = textLines
      .map((lineText: string, lineIndex: number) =>
        ExpressionEditorValidator.lineTextValidate({
          lineText,
          tree,
        }),
      )
      .flat();
    return validateList;
  };
}
