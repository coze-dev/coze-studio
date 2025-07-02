import { type FileItem } from '../types';

/**
 * 获取图片的宽高
 */
export async function getImageSize(
  file: FileItem,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = e => {
      reject(e);
    };
    img.src = url;
  });
}
