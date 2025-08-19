/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { ImagePreview as ImagePreviewSemi } from '@coze-arch/bot-semi';

import { useGlobalStore } from '@/store';

interface PreviewProps {
  zIndex: number;
  className?: string;
}
export const ImagePreview: React.FC<PreviewProps> = ({ zIndex, className }) => {
  const { imagePreviewUrl, imagePreviewVisible, setImagePreview } =
    useGlobalStore(
      useShallow(s => ({
        imagePreviewVisible: s.imagePreview.visible,
        imagePreviewUrl: s.imagePreview.url,
        setImagePreview: s.setImagePreview,
      })),
    );
  const onVisibleChange = (visible: boolean) => {
    setImagePreview(preview => (preview.visible = visible));
  };
  const [imageUrl, setImageUrl] = useState(imagePreviewUrl);
  useEffect(() => {
    setImageUrl(imagePreviewUrl);
    (async () => {
      if (imagePreviewUrl?.startsWith('blob:')) {
        const base64Url = await revertBlobUrlToBase64(imagePreviewUrl);
        if (base64Url) {
          setImageUrl(base64Url);
        }
      }
    })();
  }, [imagePreviewUrl]);
  return (
    <ImagePreviewSemi
      previewCls={className}
      zIndex={zIndex}
      src={imageUrl}
      visible={imagePreviewVisible}
      onVisibleChange={onVisibleChange}
    />
  );
};
const revertBlobUrlToBase64 = (blobUrl: string): Promise<string | null> =>
  new Promise((resolve, reject) => {
    (async () => {
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data as string);
        };

        reader.onerror = error => {
          console.error('转换过程中出现错误:', error);
          resolve(null);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('转换过程中出现错误:', error);
        resolve(null);
      }
    })();
  });
