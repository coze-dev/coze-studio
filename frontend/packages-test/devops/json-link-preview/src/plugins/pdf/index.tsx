//  目前拿不到文件的 size 信息 文件过大会导致浏览器卡顿 PDF 暂时不需要注册进去 之后放开
import { JsonPreviewBasePlugin } from '../base';
import OverlayAPI from '../../common/overlay';
import PdfPreviewContent from './preview';

export class PdfPreview extends JsonPreviewBasePlugin {
  name = 'pdf';
  match = (contentType: string) => contentType === 'pdf';
  override priority = 0;
  render = (link: string, extraInfo?: Record<string, string>) => {
    OverlayAPI.show({
      content: onclose => (
        <PdfPreviewContent src={link} extraInfo={extraInfo} onClose={onclose} />
      ),
    });
    return <></>;
  };
}
