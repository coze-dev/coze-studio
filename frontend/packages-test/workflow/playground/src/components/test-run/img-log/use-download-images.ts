import { useGlobalState } from '../../../hooks';

export function useDownloadImages(images: string[]) {
  const {
    info: { name },
  } = useGlobalState();

  const downloadImages = () => {
    images.forEach(url => {
      downloadImage(url, name);
    });
  };

  return downloadImages;
}

async function downloadImage(imageSrc, name) {
  const image = await fetch(imageSrc);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement('a');
  link.href = imageURL;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
