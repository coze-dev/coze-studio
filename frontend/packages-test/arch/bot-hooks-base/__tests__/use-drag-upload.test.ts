import { renderHook } from '@testing-library/react-hooks';

import { useDragAndPasteUpload } from '../src/use-drag-and-paste-upload';

describe('useDragAndPasteUpload', () => {
  it('return correctly', () => {
    const ref = { current: null };
    const {
      result: { current },
    } = renderHook(() =>
      useDragAndPasteUpload({
        ref,
        disableDrag: false,
        disablePaste: false,
        onUpload: () => 0,
        fileLimit: 3,
        isFileFormatValid: () => true,

        maxFileSize: 10 * 1024 * 1024,
        closeDelay: undefined,
        invalidFormatMessage: '不支持的文件类型',
        invalidSizeMessage: '不支持文件大小超过 10MB',
        fileExceedsMessage: '最多上传 3 个文件',
        getExistingFileCount: () => 0,
      }),
    );

    expect(current).toMatchObject({
      isDragOver: false,
    });
  });
});
