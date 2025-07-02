import { describe, it, expect } from 'vitest';

import { concatTestId } from '../../src/utils/concat-test-id';

describe('concat-test-id', () => {
  it('应该正确连接多个测试 ID', () => {
    const result = concatTestId('a', 'b', 'c');
    expect(result).toBe('a.b.c');
  });

  it('应该过滤掉空字符串', () => {
    const result = concatTestId('a', '', 'c');
    expect(result).toBe('a.c');
  });

  it('应该过滤掉 undefined 和 null', () => {
    const result = concatTestId('a', undefined as any, 'c', null as any);
    expect(result).toBe('a.c');
  });

  it('应该在只有一个有效 ID 时正确返回', () => {
    const result = concatTestId('a');
    expect(result).toBe('a');
  });

  it('应该在所有 ID 都无效时返回空字符串', () => {
    const result = concatTestId('', undefined as any, null as any);
    expect(result).toBe('');
  });

  it('应该在没有参数时返回空字符串', () => {
    const result = concatTestId();
    expect(result).toBe('');
  });

  it('应该正确处理包含点号的 ID', () => {
    const result = concatTestId('a.x', 'b', 'c.y');
    expect(result).toBe('a.x.b.c.y');
  });

  it('应该正确处理数字 ID', () => {
    const result = concatTestId('1', '2', '3');
    expect(result).toBe('1.2.3');
  });
});
