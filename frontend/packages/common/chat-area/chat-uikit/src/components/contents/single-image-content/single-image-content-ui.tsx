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

import classNames from 'classnames';
import { Image } from '@coze-arch/coze-design';

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
       * The preview function that comes with the semi Image component is not used here. There are side effects in the incoming onImageClick callback that will pull the preview component
       */
      preview={false}
    />
  </div>
);

SingleImageContentUI.displayName = 'SingleImageContentUI';
