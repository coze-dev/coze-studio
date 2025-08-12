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

/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import { SyntaxType } from '@coze-arch/idl-parser';

export enum BaseSyntaxType {
  ByteKeyword = SyntaxType.ByteKeyword,
  I8Keyword = SyntaxType.I8Keyword,
  I16Keyword = SyntaxType.I16Keyword,
  I32Keyword = SyntaxType.I32Keyword,
  DoubleKeyword = SyntaxType.DoubleKeyword,
  BinaryKeyword = SyntaxType.BinaryKeyword,
  StringKeyword = SyntaxType.StringKeyword,
  BoolKeyword = SyntaxType.BoolKeyword,
  I64Keyword = SyntaxType.I64Keyword,
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TypeMapper {
  private static typeMap: {
    [key: string]: 'number' | 'string' | 'object' | 'boolean';
  } = {
    [SyntaxType.ByteKeyword]: 'number',
    [SyntaxType.I8Keyword]: 'number',
    [SyntaxType.I16Keyword]: 'number',
    [SyntaxType.I32Keyword]: 'number',
    [SyntaxType.DoubleKeyword]: 'number',
    [SyntaxType.BinaryKeyword]: 'object',
    [SyntaxType.StringKeyword]: 'string',
    [SyntaxType.BoolKeyword]: 'boolean',
    [SyntaxType.I64Keyword]: 'number',
  };
  static map(idlType: BaseSyntaxType) {
    const res = TypeMapper.typeMap[idlType];
    if (!res) {
      throw new Error(`UnKnown type: ${idlType}`);
    }
    return res;
  }
  static setI64(type: 'number' | 'string') {
    TypeMapper.typeMap[SyntaxType.I64Keyword] = type;
  }
}
