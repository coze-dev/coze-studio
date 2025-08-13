import { ProductApi } from '@coze-arch/bot-api';

export const replaceUrl = (url: string) =>
  url.replace('@minio/public-cbbiz', '/filestore/dev-public-cbbiz');

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result.slice(result.indexOf(',') + 1));
      } else {
        reject(new Error('readAsDataURL failed'));
      }
    };
    fileReader.readAsDataURL(file);
  });
}

export const uploadRequest = uploadApi => async args => {
  const { fileInstance, onProgress, onSuccess, onError } = args;
  try {
    if (!fileInstance) {
      throw new Error('no file to upload');
    }
    const result = await uploadApi(
      { data: await fileToBase64(fileInstance) },
      {
        onUploadProgress: e =>
          onProgress({ total: e.total ?? fileInstance.size, loaded: e.loaded }),
      },
    );
    onSuccess(result.data);
  } catch (e) {
    onError({});
  }
};
