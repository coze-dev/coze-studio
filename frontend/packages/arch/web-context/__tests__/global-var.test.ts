import { globalVars } from '../src/global-var';

describe('global-var', () => {
  test('should be able to set and get a property', () => {
    const testValue = 'Hello, World';
    // 设置一个属性
    globalVars.TEST_PROP = testValue;

    // 确保我们能获取到相同的属性
    expect(globalVars.TEST_PROP).toBe(testValue);
  });

  test('should return undefined for unset property', () => {
    expect(globalVars.UNSET_PROP).toBeUndefined();
  });

  test('should allow to overwrite an existing property', () => {
    const firstValue = 'First Value';
    const secondValue = 'Second Value';

    // 先设置一个属性
    globalVars.OVERWRITE_PROP = firstValue;
    expect(globalVars.OVERWRITE_PROP).toBe(firstValue);

    // 再覆盖这个属性
    globalVars.OVERWRITE_PROP = secondValue;
    expect(globalVars.OVERWRITE_PROP).toBe(secondValue);
  });
});
