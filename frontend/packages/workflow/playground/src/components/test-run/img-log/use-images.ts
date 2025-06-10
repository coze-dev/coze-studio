import { useTestRunOutputsValue } from './use-test-run-outputs-value';
import { useParseImages } from './use-parse-images';
import { useDownloadImages } from './use-download-images';
export function useImages(): {
  images: string[];
  downloadImages: () => void;
} {
  const outputsValue = useTestRunOutputsValue();
  const images = useParseImages(outputsValue);
  const downloadImages = useDownloadImages(images);

  return {
    images,
    downloadImages,
  };
}
