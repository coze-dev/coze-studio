import { JsonPreviewBasePlugin } from '../base';
import OverlayAPI from '../../common/overlay';
import { ImagePreviewContent } from './preview';

export class ImagePreview extends JsonPreviewBasePlugin {
  render = (link: string, extraInfo?: Record<string, string>) => {
    OverlayAPI.show({
      content: onclose => <ImagePreviewContent src={link} onClose={onclose} />,
      withMask: false,
    });
    return <></>;
  };
  name = 'Image';
  match = (contentType: string) => contentType === 'image';
  override priority = 0;
}
