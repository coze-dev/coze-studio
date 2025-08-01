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

import { useRef } from 'react';

import cls from 'classnames';
import { useSize } from 'ahooks';
import { ImagePreview, Image } from '@coze-arch/coze-design';

import css from './images-preview.module.less';

interface ImagesPreviewProps {
  images: string[];
}

export const ImagesPreview: React.FC<ImagesPreviewProps> = ({ images }) => {
  const onlyOne = images.length === 1;
  const ref = useRef(null);
  const size = useSize(ref);

  return (
    <div ref={ref}>
      <ImagePreview
        className={cls(css['preview-group'], {
          [css['only-one']]: onlyOne,
          [css['columns-5']]: size?.width && size?.width > 420,
        })}
        getPopupContainer={() => document.body}
      >
        {images.map((url, index) => (
          <Image
            key={`${url}_${index}`}
            src={url}
            className={css['image-item']}
          />
        ))}
      </ImagePreview>
    </div>
  );
};
