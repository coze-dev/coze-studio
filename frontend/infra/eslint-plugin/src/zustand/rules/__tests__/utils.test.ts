import { describe, it, expect } from 'vitest';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  isObjLiteral,
  extractIdentifiersFromPattern,
  isSameIdentifier,
} from '../utils';

describe('isObjLiteral', () => {
  it('should return true for ObjectExpression', () => {
    const node = { type: 'ObjectExpression' } as unknown as TSESTree.Expression;
    expect(isObjLiteral(node)).toBe(true);
  });

  it('should return true for ArrayExpression', () => {
    const node = { type: 'ArrayExpression' } as unknown as TSESTree.Expression;
    expect(isObjLiteral(node)).toBe(true);
  });

  it('should return false for other types', () => {
    const node = { type: 'Literal' } as unknown as TSESTree.Expression;
    expect(isObjLiteral(node)).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(isObjLiteral(null as any)).toBe(false);
    expect(isObjLiteral(undefined as any)).toBe(false);
  });
});

describe('extractIdentifiersFromPattern', () => {
  it('should extract identifiers from a simple identifier pattern', () => {
    const node = {
      type: AST_NODE_TYPES.Identifier,
      name: 'a',
    };
    const result = extractIdentifiersFromPattern(node as TSESTree.Identifier);
    expect(result).toEqual([node]);
  });

  it('should extract identifiers from an object pattern', () => {
    const node = {
      type: 'ObjectPattern',
      properties: [
        {
          type: 'Property',
          value: { type: AST_NODE_TYPES.Identifier, name: 'a' },
        },
        {
          type: 'RestElement',
          argument: { type: AST_NODE_TYPES.Identifier, name: 'b' },
        },
      ],
    };
    const result = extractIdentifiersFromPattern(
      node as TSESTree.ObjectPattern,
    );
    expect(result).toEqual([
      { type: AST_NODE_TYPES.Identifier, name: 'a' },
      { type: AST_NODE_TYPES.Identifier, name: 'b' },
    ]);
  });

  it('should extract identifiers from an array pattern', () => {
    const node = {
      type: AST_NODE_TYPES.ArrayPattern,
      elements: [
        { type: AST_NODE_TYPES.Identifier, name: 'a' },
        null,
        { type: AST_NODE_TYPES.Identifier, name: 'b' },
      ],
    };
    const result = extractIdentifiersFromPattern(node as TSESTree.ArrayPattern);
    expect(result).toEqual([
      { type: AST_NODE_TYPES.Identifier, name: 'a' },
      { type: AST_NODE_TYPES.Identifier, name: 'b' },
    ]);
  });

  it('should extract identifiers from nested patterns', () => {
    const node = {
      type: 'ObjectPattern',
      properties: [
        {
          type: 'Property',
          value: {
            type: 'ArrayPattern',
            elements: [
              { type: AST_NODE_TYPES.Identifier, name: 'a' },
              { type: AST_NODE_TYPES.Identifier, name: 'b' },
            ],
          },
        },
      ],
    };
    const result = extractIdentifiersFromPattern(
      node as TSESTree.ObjectPattern,
    );
    expect(result).toEqual([
      { type: AST_NODE_TYPES.Identifier, name: 'a' },
      { type: AST_NODE_TYPES.Identifier, name: 'b' },
    ]);
  });

  it('should handle empty patterns', () => {
    const node = {
      type: AST_NODE_TYPES.ObjectPattern,
      properties: [],
    };
    const result = extractIdentifiersFromPattern(
      node as unknown as TSESTree.ObjectPattern,
    );
    expect(result).toEqual([]);
  });
});

describe('isSameIdentifier', () => {
  it('should return true for identical identifiers', () => {
    //@ts-expect-error -- ignore mock
    const id1: TSESTree.Identifier = {
      name: 'foo',
      range: [0, 5],
      type: AST_NODE_TYPES.Identifier,
    };
    //@ts-expect-error -- ignore mock
    const id2: TSESTree.Identifier = {
      name: 'foo',
      range: [0, 5],
      type: AST_NODE_TYPES.Identifier,
    };
    expect(isSameIdentifier(id1, id2)).toBe(true);
  });

  it('should return false for different names', () => {
    //@ts-expect-error -- ignore mock
    const id1: TSESTree.Identifier = {
      name: 'foo',
      range: [0, 5],
      type: AST_NODE_TYPES.Identifier,
    };
    //@ts-expect-error -- ignore mock
    const id2: TSESTree.Identifier = {
      name: 'bar',
      range: [0, 5],
      type: AST_NODE_TYPES.Identifier,
    };
    expect(isSameIdentifier(id1, id2)).toBe(false);
  });

  it('should return false for different ranges', () => {
    //@ts-expect-error -- ignore mock
    const id1: TSESTree.Identifier = {
      name: 'foo',
      range: [0, 5],
      type: AST_NODE_TYPES.Identifier,
    };
    //@ts-expect-error -- ignore mock
    const id2: TSESTree.Identifier = {
      name: 'foo',
      range: [0, 6],
      type: AST_NODE_TYPES.Identifier,
    };
    expect(isSameIdentifier(id1, id2)).toBe(false);
  });

  it('should return false if one identifier is undefined', () => {
    //@ts-expect-error -- ignore mock
    const id1: TSESTree.Identifier = {
      name: 'foo',
      range: [0, 5],
      type: AST_NODE_TYPES.Identifier,
    };
    expect(isSameIdentifier(id1, undefined)).toBe(false);
    expect(isSameIdentifier(undefined, id1)).toBe(false);
  });

  it('should return false if both identifiers are undefined', () => {
    expect(isSameIdentifier(undefined, undefined)).toBe(false);
  });
});
