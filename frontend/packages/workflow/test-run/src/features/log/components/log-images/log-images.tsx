import { I18n } from '@coze-arch/i18n';
import { IconCozArrowBottom } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { LogWrap } from '../log-parser/log-wrap';
import { ImagesPreview } from './images-preview';

interface LogImagesProps {
  images: string[];
  onDownload?: () => void;
}

export const LogImages: React.FC<LogImagesProps> = ({ images, onDownload }) => {
  if (!images || !images.length) {
    return null;
  }

  return (
    <LogWrap
      labelStyle={{
        height: '24px',
      }}
      label={I18n.t('imageflow_output_display')}
      copyable={false}
      extra={
        <Button
          icon={<IconCozArrowBottom />}
          color="primary"
          type="primary"
          onClick={onDownload}
          size="small"
        >
          {I18n.t('imageflow_output_display_save')}
        </Button>
      }
    >
      <ImagesPreview images={images} />
    </LogWrap>
  );
};
