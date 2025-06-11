import { type CSSProperties } from 'react';

import { IconCozFileImage } from '@coze/coze-design/illustrations';
import { Spin, Image } from '@coze-arch/bot-semi';

import {
  FileItemStatus,
  PREVIEW_IMAGE_TYPE,
  getFileExtension,
} from '@/hooks/use-upload';

import { getIconByExtension } from './get-icon-by-extension';

import styles from './index.module.less';

interface FileIconProps {
  file: {
    name: string;
    url?: string;
    status?: string;
  };
  size?: number;
  iconStyle?: CSSProperties;
  loadingStyle?: CSSProperties;
  hideLoadingIcon?: boolean;
}

export const FileIcon = (props: FileIconProps) => {
  const { size = 20, file, iconStyle, loadingStyle, hideLoadingIcon } = props;

  const { url, name, status } = file;

  const extension = getFileExtension(name);

  if (status === FileItemStatus.Uploading && !hideLoadingIcon) {
    return (
      <Spin
        wrapperClassName={styles['file-icon-loading']}
        style={{
          width: size,
          height: size,
          lineHeight: `${size}px`,
          ...loadingStyle,
        }}
        spinning
      />
    );
  }

  if (PREVIEW_IMAGE_TYPE.includes(extension)) {
    if (!url) {
      return (
        <IconCozFileImage
          style={{ width: size, height: size, fontSize: size, ...iconStyle }}
        />
      );
    }

    return (
      <Image
        preview={false}
        className="object-contain object-center rounded-sm border-0"
        style={{ width: size, height: size, ...iconStyle }}
        imgStyle={{ width: size, height: size }}
        src={url}
        alt=""
      />
    );
  }

  const Icon = getIconByExtension(extension);

  return (
    <Icon style={{ width: size, height: size, fontSize: size, ...iconStyle }} />
  );
};
