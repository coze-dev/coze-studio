import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { Toast } from '@coze/coze-design';

export const getEllipsisCount = (num: number, max: number): string =>
  num > max ? `${max}+` : `${num}`;

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) {
    return '0 Byte';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const digit = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${digit} ${sizes[i]}`;
};

export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;

      if (!result || typeof result !== 'string') {
        reject(new CustomError('getBase64', 'file read invalid'));
        return;
      }

      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.onerror = () => {
      Toast.error(I18n.t('read_file_failed_please_retry'));
      reject(new CustomError('getBase64', 'file read fail'));
    };
    fileReader.onabort = () => {
      reject(new CustomError('getBase64', 'file read abort'));
    };
    fileReader.readAsDataURL(file);
  });

export const getUint8Array = (file: Blob): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = event => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      } else {
        reject(new CustomError('getUint8Array', 'file read invalid'));
      }
    };

    fileReader.readAsArrayBuffer(file);
  });

export const getFileExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1);
};
