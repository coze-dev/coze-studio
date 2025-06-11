import { generateError } from '../../src/utils/error';

describe('error', () => {
  test('test error', () => {
    const testMessage = 'test error';
    const result = generateError(testMessage);

    expect(result).toEqual(
      new Error(`[Bot Platform Tool Hooks]: ${testMessage}`),
    );
  });
});
