import { Spin, Image } from '@coze/coze-design';

import { getIconByExtension, getFileExtension } from './utils';
import { FileItemStatus, PREVIEW_IMAGE_TYPE } from './constants';

import styles from './file-icon.module.less';

interface FileIconProps {
  file: {
    name: string;
    url?: string;
    status?: string;
  };
  size?: number;
}

export const FileIcon = (props: FileIconProps) => {
  const { size = 20, file } = props;

  const { url, name, status } = file;

  const extension = getFileExtension(name);

  if (status === FileItemStatus.Uploading) {
    return (
      <Spin
        wrapperClassName={styles['file-icon-loading']}
        style={{ width: size, height: size, lineHeight: `${size}px` }}
        spinning
      />
    );
  }

  if (PREVIEW_IMAGE_TYPE.includes(extension)) {
    return (
      <Image
        preview={false}
        className="object-contain object-center rounded-sm border-0"
        style={{ width: size, height: size }}
        imgStyle={{ width: size, height: size }}
        src={url}
        alt=""
      />
    );
  }

  const Icon = getIconByExtension(extension);

  return <Icon style={{ width: size, height: size, fontSize: size }} />;
};
