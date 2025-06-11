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
