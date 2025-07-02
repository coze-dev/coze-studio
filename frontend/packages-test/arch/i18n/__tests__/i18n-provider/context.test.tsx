import { describe, it, expect } from 'vitest';

import { i18nContext } from '../../src/i18n-provider/context';

describe('i18n-provider/context', () => {
  it('should create a context with default values', () => {
    // 验证 i18nContext 是否被正确创建
    expect(i18nContext).toBeDefined();

    // 获取默认值 - 使用类型断言访问内部属性
    // @ts-expect-error - 访问内部属性
    const defaultValue = i18nContext._currentValue;

    // 验证默认值中的 i18n 对象是否存在
    expect(defaultValue.i18n).toBeDefined();

    // 验证 t 函数是否存在
    expect(defaultValue.i18n.t).toBeDefined();
    expect(typeof defaultValue.i18n.t).toBe('function');

    // 验证 t 函数的行为
    expect(defaultValue.i18n.t('test-key')).toBe('test-key');

    // 验证 i18nContext 是一个对象
    expect(typeof i18nContext).toBe('object');
  });
});
