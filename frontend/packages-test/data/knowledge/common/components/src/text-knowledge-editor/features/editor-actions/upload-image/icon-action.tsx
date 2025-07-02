import { IconCozImage } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { BaseUploadImage, type BaseUploadImageProps } from './base';

export const UploadImageIcon = (
  props: Omit<BaseUploadImageProps, 'renderUI'>,
) => (
  <BaseUploadImage
    {...props}
    renderUI={({ disabled }) => (
      <IconButton
        disabled={disabled}
        size="small"
        color="secondary"
        iconPosition="left"
        className="coz-fg-secondary leading-none !w-6 !h-6"
        icon={<IconCozImage className="text-[14px]" />}
      />
    )}
  />
);
