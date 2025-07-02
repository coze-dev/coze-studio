import React, { useEffect, useState } from 'react';

import { Image } from '@coze-arch/bot-semi';
import { IconImageFailOutlined } from '@coze-arch/bot-icons';

import styles from '../index.module.less';
import { useImagePreview } from './use-image-preview';
export interface ImageRenderProps {
  srcList: string[];
  // 图片是否可编辑，默认为false
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
        // 失败时兜底图
        fallback={
          <IconImageFailOutlined
            className={styles['image-failed']}
            onClick={() => {
              setCurSrc?.(src);
              onClick?.();
            }}
          />
        }
        // 图片加载时的占位图，主要用于大图加载
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
