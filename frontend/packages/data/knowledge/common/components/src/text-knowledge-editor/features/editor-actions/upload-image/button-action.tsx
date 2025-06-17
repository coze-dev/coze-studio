import { I18n } from '@coze-arch/i18n';
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { BaseUploadImage, type BaseUploadImageProps } from './base';

export const UploadImageButton = (
  props: Omit<BaseUploadImageProps, 'renderUI'>,
) => (
  <BaseUploadImage
    {...props}
    renderUI={({ disabled }) => (
      <Button
        disabled={disabled}
        color="primary"
        className="coz-fg-primary leading-none"
        icon={<IconCozImage className="text-[14px]" />}
      >
        {I18n.t('knowledge_insert_img_002')}
      </Button>
    )}
  />
);
