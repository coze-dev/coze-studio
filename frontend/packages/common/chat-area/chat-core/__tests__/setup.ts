import eventEmitter from 'eventemitter3';

vi.stubGlobal('IS_OVERSEA', false);
vi.spyOn(global.URL, 'createObjectURL').mockImplementation(() => 'mocked URL');
// global.File = class MockFile {
//   filename: string;
//   constructor(
//     parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
//     filename: string,
//     properties?: FilePropertyBag,
//   ) {
//     this.filename = filename;
//   }
// };

export const testSetup = () => {
  vi.mock('../src/report-log', () => ({
    ReportLog: vi.fn().mockImplementation(() => ({
      init: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      slardarInfo: vi.fn(),
      slardarSuccess: vi.fn(),
      slardarError: vi.fn(),
      slardarEvent: vi.fn(),
      slardarErrorEvent: vi.fn(),
      slardarTracer: vi.fn(),
      createLoggerWith: () => ({
        slardarEvent: vi.fn(),
        init: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        slardarInfo: vi.fn(),
        slardarSuccess: vi.fn(),
        slardarError: vi.fn(),
        slardarErrorEvent: vi.fn(),
        slardarTracer: vi.fn(),
      }),
    })),
  }));
  vi.mock('@slardar/web/client', () => ({
    createMinimalBrowserClient: vi.fn(),
  }));
  // mock上传插件实现
  vi.mock('../src/plugins/upload-plugin', () => ({
    ChatCoreUploadPlugin: class {
      eventBus = new eventEmitter();
      on(event: string, fn: () => void) {
        this.eventBus.on(event, fn);
      }
      emit(event: string, data: unknown) {
        this.eventBus.emit(event, data);
      }
    },
  }));
};
