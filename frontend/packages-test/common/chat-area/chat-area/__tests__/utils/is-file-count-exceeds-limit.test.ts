import { isFileCountExceedsLimit } from '../../src/utils/is-file-count-exceeds-limit';

describe('is-file-count-exceeds-limit', () => {
  test('expect to be true', () => {
    const res = isFileCountExceedsLimit({
      fileCount: 5,
      fileLimit: 6,
      existingFileCount: 3,
    });
    expect(res).toBeTruthy();
  });
  test('expect to be false', () => {
    const res = isFileCountExceedsLimit({
      fileCount: 5,
      fileLimit: 6,
      existingFileCount: 1,
    });
    expect(res).toBeFalsy();
  });
});
