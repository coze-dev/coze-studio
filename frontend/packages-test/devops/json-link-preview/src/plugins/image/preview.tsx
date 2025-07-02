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
