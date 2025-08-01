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

import { Spin, ImagePreview } from '@coze-arch/coze-design';

import { LoadError } from '../../common/load-error';
import useImage from './hooks';

import styles from './index.module.less';

interface ImagePreviewContentProps {
  src: string;
  onClose?: VoidFunction;
}

export const ImagePreviewContent = ({
  src,
  onClose,
}: ImagePreviewContentProps) => {
  const { hasError, image, isLoaded } = useImage(src);

  if (hasError) {
    return (
      <div className="w-full h-full items-center justify-center flex">
        <LoadError onClose={onClose} />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full items-center justify-center flex">
        <Spin />
      </div>
    );
  }
  return (
    <div className={styles['image-preview-container']}>
      <ImagePreview
        src={image?.src}
        visible
        previewCls={styles['image-preview-wrapper']}
        closable={false}
      />
    </div>
  );
};
