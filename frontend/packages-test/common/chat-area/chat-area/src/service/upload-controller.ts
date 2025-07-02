import { isImage } from '../utils/batch-file-upload';
import { type EventPayloadMap, UploadPlugin } from './upload-plugin';

export interface UploadControllerProps {
  fileId: string;
  file: File;
  userId: string;
  onProgress: (event: EventPayloadMap['progress'], fileId: string) => void;
  onComplete: (event: EventPayloadMap['complete'], fileId: string) => void;
  onError: (event: EventPayloadMap['error'], fileId: string) => void;
  onReady: (event: EventPayloadMap['ready'], fileId: string) => void;
}

export class UploadController {
  fileId: string;
  uploadPlugin: UploadPlugin;

  constructor({
    fileId,
    file,
    userId,
    onProgress,
    onComplete,
    onError,
    onReady,
  }: UploadControllerProps) {
    this.fileId = fileId;
    this.uploadPlugin = new UploadPlugin({
      file,
      userId,
      type: isImage(file) ? 'image' : 'object',
    });
    this.uploadPlugin.on('progress', event => onProgress(event, fileId));
    this.uploadPlugin.on('complete', event => onComplete(event, fileId));
    this.uploadPlugin.on('error', event => onError(event, fileId));
    this.uploadPlugin.on('ready', event => onReady(event, fileId));
  }

  cancel = () => {
    this.uploadPlugin.cancel();
  };
}
