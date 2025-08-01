/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type FC } from 'react';

import classNames from 'classnames';
import { Row, Col } from '@coze-arch/coze-design';
import { Image } from '@coze-arch/bot-md-box-adapter/slots';
import {
  type OnImageClickCallback,
  type OnImageRenderCallback,
} from '@coze-arch/bot-md-box-adapter';

import './index.less';

export enum CompressAlgorithm {
  None = 0,
  Snappy = 1,
  Zstd = 2,
}
export interface MsgContentData {
  card_data?: string;
  compress?: CompressAlgorithm;
}

export interface ContentBoxEvents {
  onError?: (err: unknown) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onLoad?: () => Promise<MsgContentData | undefined>;
}

export interface BaseContentBoxProps {
  /** Whether in the browser window, true: in, false: not, undefined: not detected */
  inView?: boolean;
  contentBoxEvents?: ContentBoxEvents;
}

export interface ImageMessageContent {
  key: string;
  image_thumb: {
    url: string;
    width: number;
    height: number;
  };
  image_ori: {
    url: string;
    width: number;
    height: number;
  };
  request_id?: string;
}

export interface ImageContent {
  image_list: ImageMessageContent[];
}

export interface ImageBoxProps extends BaseContentBoxProps {
  data: ImageContent;
  eventCallbacks?: {
    onImageClick?: OnImageClickCallback;
    onImageRender?: OnImageRenderCallback;
  };
}
const getImageBoxGutterAndSpan = (
  length: number,
): {
  gutter: React.ComponentProps<typeof Row>['gutter'];
  span: React.ComponentProps<typeof Col>['span'];
} => {
  if (length === 1) {
    return { gutter: [1, 1], span: 24 };
  }
  return { gutter: [2, 2], span: 12 };
};

export const ImageBox: FC<ImageBoxProps> = ({ data, eventCallbacks }) => {
  const { onImageClick, onImageRender } = eventCallbacks || {};
  const { image_list = [] } = data || {};

  const layout = getImageBoxGutterAndSpan(image_list?.length);

  return (
    <div className={classNames('chat-uikit-image-box', 'rounded-normal')}>
      <Row gutter={layout.gutter}>
        {image_list.map(({ image_thumb }, index) => (
          <Col span={layout.span} key={index}>
            <Image
              onImageClick={onImageClick}
              onImageRender={onImageRender}
              src={image_thumb.url}
              imageOptions={{
                squareContainer: true,
              }}
              className="object-cover"
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};
