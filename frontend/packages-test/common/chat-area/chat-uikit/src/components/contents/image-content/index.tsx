import { ErrorBoundary } from 'react-error-boundary';
import { type FC } from 'react';

import { Image } from '@coze-arch/coze-design';
import {
  type IOnImageClickParams,
  type IBaseContentProps,
} from '@coze-common/chat-uikit-shared';

import { safeJSONParse } from '../../../utils/safe-json-parse';
import { isImage } from '../../../utils/is-image';
import defaultImage from '../../../assets/image-empty.png';
import { ImageBox } from './image-box';

import './index.less';

export type IImageMessageContentProps = IBaseContentProps & {
  onImageClick?: (params: IOnImageClickParams) => void;
};

export const ImageContentImpl: FC<IImageMessageContentProps> = props => {
  const { message, onImageClick } = props;

  const { content_obj = safeJSONParse(message.content) } = message;

  if (!isImage(content_obj)) {
    return null;
  }

  return (
    <div className="chat-uikit-image-content">
      <ImageBox
        data={{
          image_list: content_obj?.image_list ?? [],
        }}
        eventCallbacks={{
          onImageClick: (e, eventData) => {
            onImageClick?.({
              message,
              extra: { url: eventData.src as string },
            });
          },
        }}
      />
    </div>
  );
};

ImageContentImpl.displayName = 'ImageContentImpl';

export const ImageContent: FC<IImageMessageContentProps> = props => (
  <ErrorBoundary
    fallback={
      <div className="chat-uikit-image-error-boundary">
        <Image src={defaultImage} preview={false} />
      </div>
    }
  >
    <ImageContentImpl {...props} />
  </ErrorBoundary>
);

ImageContent.displayName = 'ImageContent';
