import { uploadFileV2 } from '../src/upload-file-v2';
vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetUploadAuthToken: vi.fn(() =>
      Promise.resolve({ data: { service_id: '', upload_host: '' } }),
    ),
  },
}));
vi.mock('@coze-studio/uploader-adapter', () => {
  class MockUploader {
    start = () => 0;
    addFile = () => '12312341';
    test: 'test';
    on(event: string, cb: (data: any) => void) {
      if (event === 'complete') {
        cb({ uploadResult: { Uri: 'test_url' } });
      } else if (event === 'error') {
        cb({ extra: 'error' });
      } else if (event === 'progress') {
        cb(50);
      }
    }
  }
  return {
    getUploader: vi.fn((props: any, isOverSea?: boolean) => new MockUploader()),
  };
});

describe('upload-file', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('upLoadFile should resolve Url of result if upload success', () =>
    new Promise((resolve, reject) => {
      global.IS_OVERSEA = true;
      uploadFileV2({
        fileItemList: [{ file: new File([], 'test_file'), fileType: 'image' }],
        userId: '123',
        timeout: undefined,
        signal: new AbortSignal(),
        onSuccess: event => {
          try {
            expect(event.uploadResult.Uri).equal('test_url');
            resolve('ok');
          } catch (e) {
            reject(e);
          }
        },
        onUploadAllSuccess(event) {
          try {
            expect(event[0].uploadResult.Uri).equal('test_url');
            resolve('ok');
          } catch (e) {
            reject(e);
          }
        },
      });
      global.IS_OVERSEA = false;
      uploadFileV2({
        fileItemList: [{ file: new File([], 'test_file'), fileType: 'image' }],
        userId: '123',
        timeout: undefined,
        signal: new AbortSignal(),
        onSuccess: event => {
          try {
            expect(event.uploadResult.Uri).equal('test_url');
            resolve('ok');
          } catch (e) {
            reject(e);
          }
        },
        onUploadAllSuccess(event) {
          try {
            expect(event[0].uploadResult.Uri).equal('test_url');
            resolve('ok');
          } catch (e) {
            reject(e);
          }
        },
      });
    }));
});
