import { ImgLog } from '../../../components/test-run/img-log';
import { useImagePreviewVisible } from './hooks/use-image-preview-visible';

export function ImagePreview() {
  const imagePreviewVisible = useImagePreviewVisible();

  if (imagePreviewVisible) {
    return <ImgLog />;
  }

  return null;
}
