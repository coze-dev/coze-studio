import Uploader, { type ImageXFileOption } from 'tt-uploader';
import {
  type Config,
  type STSToken,
  type ObjectSync,
} from '@coze-arch/uploader-interface';

export interface FileOption {
  file: Blob;
  stsToken: STSToken;
  type?: any;
  callbackArgs?: string;
  testHost?: string;
  objectSync?: ObjectSync;
}

export const getUploader = (config: Config, isOversea?: boolean) => {
  const imageHost = (
    config.imageHost ||
    config.imageFallbackHost ||
    ''
  ).replace(/^https:\/\//, '');
  const uploader = new Uploader({
    region: isOversea ? 'ap-singapore-1' : 'cn-north-1',
    imageHost,
    appId: config.appId,
    userId: config.userId,
    useFileExtension: config.useFileExtension,
    uploadTimeout: config.uploadTimeout,
    imageConfig: config.imageConfig,
  });

  const originalAddImageFile: (option: ImageXFileOption) => string =
    uploader.addImageFile.bind(uploader);

  uploader.addFile = function (options: FileOption) {
    const imageOptions: ImageXFileOption = {
      file: options.file,
      stsToken: options.stsToken,
    };
    return originalAddImageFile(imageOptions);
  };
  return uploader as CozeUploader;
};

type UploadEventName = 'complete' | 'error' | 'progress' | 'stream-progress';

export type CozeUploader = Uploader & {
  addFile: (options: FileOption) => string;
  removeAllListeners: (eventName: UploadEventName) => void;
};

export {
  type Config,
  type EventPayloadMaps,
} from '@coze-arch/uploader-interface';
