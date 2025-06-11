import { useRef } from 'react';

import cls from 'classnames';
import { useSize } from 'ahooks';
import { ImagePreview, Image } from '@coze/coze-design';

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
