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

import React from 'react';

import { ImagePreview, Image } from '@coze-arch/bot-semi';

import { useElementWidth } from './use-element-width';

import styles from './index.module.less';

interface ImagesProps {
  images?: string[];
}

export const Images = ({ images = [] }: ImagesProps) => {
  const { width, ref } = useElementWidth<HTMLDivElement>();
  const onlyOneImage = images.length === 1;
  const itemWidth = onlyOneImage ? width : (width - 12) / 2;
  const itemHeight = Math.min((3 / 4) * itemWidth, 280);
  const contentMaxHeight = onlyOneImage ? 'auto' : itemHeight * 2.5 + 16 * 2;

  return (
    <div ref={ref}>
      <ImagePreview
        className={styles.content}
        style={{ maxHeight: contentMaxHeight }}
        getPopupContainer={() => document.body}
      >
        {images.map((imageUrl, index) => (
          <Image
            key={index}
            className={styles.item}
            style={{ width: itemWidth, height: itemHeight }}
            src={imageUrl}
          />
        ))}
      </ImagePreview>
    </div>
  );
};
