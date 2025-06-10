import classNames from 'classnames';
import { Image } from '@coze/coze-design';

import EmptyImage from '../../../assets/image-empty.png';

import './index.less';

export interface SingleImageContentUIProps {
  thumbUrl: string;
  originalUrl: string;
  onClick?: (originUrl: string) => void;
  className?: string;
}

export const SingleImageContentUI: React.FC<SingleImageContentUIProps> = ({
  thumbUrl,
  originalUrl,
  onClick,
  className,
}) => (
  <div
    className={classNames(className, 'chat-uikit-single-image-content')}
    onClick={() => onClick?.(originalUrl)}
  >
    <Image
      src={thumbUrl || EmptyImage}
      className="chat-uikit-single-image-content__image"
      /**
       * 这里不采用 semi Image 组件自带的 preview 功能。传入的 onImageClick 回调中有副作用会拉起 preview 组件
       */
      preview={false}
    />
  </div>
);

SingleImageContentUI.displayName = 'SingleImageContentUI';
