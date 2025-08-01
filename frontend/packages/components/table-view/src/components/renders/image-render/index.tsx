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

import React, { useEffect, useState } from 'react';

import { Image } from '@coze-arch/bot-semi';
import { IconImageFailOutlined } from '@coze-arch/bot-icons';

import styles from '../index.module.less';
import { useImagePreview } from './use-image-preview';
export interface ImageRenderProps {
  srcList: string[];
  // Whether the picture can be edited, the default is false
  editable?: boolean;
  onChange?: (tosKey: string, src: string) => void;
  dataIndex?: string;
  className?: string;
  customEmpty?: (props: { onClick?: () => void }) => React.ReactNode;
}

export interface ImageContainerProps {
  srcList: string[];
  onClick?: () => void;
  setCurSrc?: (src: string) => void;
}

const ImageContainer = ({
  srcList,
  onClick,
  setCurSrc,
  ...imageProps
}: ImageContainerProps) => (
  <div
    className={styles['image-container']}
    onClick={() => {
      if (!srcList.length || !srcList[0]) {
        onClick?.();
      }
    }}
  >
    {srcList.map(src => (
      <Image
        {...imageProps}
        onClick={() => {
          setCurSrc?.(src);
          onClick?.();
        }}
        preview={false}
        src={src}
        // bottom line on failure
        fallback={
          <IconImageFailOutlined
            className={styles['image-failed']}
            onClick={() => {
              setCurSrc?.(src);
              onClick?.();
            }}
          />
        }
        // The placeholder map when the picture is loaded, mainly used for large image loading
        placeholder={<div className="image-skeleton" onClick={onClick} />}
      />
    ))}
  </div>
);
export const ImageRender: React.FC<ImageRenderProps> = ({
  srcList = [],
  editable = true,
  onChange,
  className = '',
  customEmpty,
}) => {
  const [curSrc, setCurSrc] = useState(srcList?.[0] || '');
  const { open, node: imagePreviewModal } = useImagePreview({
    editable,
    src: curSrc,
    setSrc: setCurSrc,
    onChange,
  });
  useEffect(() => {
    setCurSrc(srcList?.[0] || '');
  }, [srcList]);
  return (
    <div
      className={`${className} ${styles['image-render-wrapper']} ${
        !curSrc ? styles['image-render-empty'] : ''
      }`}
    >
      {(!srcList || !srcList.length) && customEmpty ? (
        customEmpty({ onClick: open })
      ) : (
        <ImageContainer
          srcList={srcList}
          onClick={open}
          setCurSrc={setCurSrc}
        />
      )}

      {imagePreviewModal}
    </div>
  );
};
