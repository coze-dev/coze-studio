import { retryImport } from '../src/retry-import';

describe('retry-import tests', () => {
  it('retryImport', async () => {
    const maxRetryCount = 3;
    let maxCount = 0;
    const mockImport = () =>
      new Promise<number>((resolve, reject) => {
        setTimeout(() => {
          if (maxCount >= maxRetryCount) {
            resolve(maxCount);
            return;
          }
          maxCount++;
          reject(new Error('load error!'));
        }, 1000);
      });
    expect(await retryImport<number>(() => mockImport(), maxRetryCount)).toBe(
      3,
    );
  });
});
