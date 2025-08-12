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

/* eslint-disable react-hooks/rules-of-hooks */
import {
  type CSSProperties,
  useEffect,
  useState,
  type FC,
  useRef,
  memo,
} from 'react';

import { isEqual } from 'lodash-es';
import classNames from 'classnames';
import { ImagePreview, Skeleton } from '@coze-arch/coze-design';
import { ImageStatus } from '@coze-arch/bot-md-box-adapter/lazy';
import { type MdBoxImageProps } from '@coze-arch/bot-md-box-adapter';

import { getImageDisplayAttribute } from '../../utils/image/get-image-display-attribute';
import { useOnboardingContext } from '../../context/onboarding';
import { useUiKitMessageBoxContext } from '../../context/message-box';
import DefaultImage from '../../assets/image-default.png';

interface OriginImageInfo {
  width?: number;
  height?: number;
}

export type CozeImageProps = MdBoxImageProps & {
  imageAutoSizeContainerWidth?: number;
  enablePreview?: boolean;
  onImageElementEnter?: (params: {
    element: HTMLElement;
    link: string;
  }) => void;
  onImageElementLeave?: (params: {
    element: HTMLElement;
    link: string;
  }) => void;
};

const TIME_OUT = 10000;

// TODO: @liushuoyan see if you can get a slot or something here
// eslint-disable-next-line @typescript-eslint/naming-convention, @coze-arch/max-line-per-function
export const _CozeImage: FC<CozeImageProps> = props => {
  const [showPreview, setShowPreview] = useState(false);
  const {
    className,
    src,
    onImageClick,
    imageAutoSizeContainerWidth: imageAutoSizeContainerWidthFromProps,
    enablePreview,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    imageAutoSizeContainerWidth: imageAutoSizeContainerWidthFromContext,
    eventCallbacks,
    onError,
  } = useUiKitMessageBoxContext();

  const {
    onMdBoxImageElementEnter: onImageElementEnterFromEventCallback,
    onMdBoxImageElementLeave: onImageElementLeaveFromEventCallback,
  } = eventCallbacks ?? {};

  const {
    imageAutoSizeContainerWidth:
      imageAutoSizeContainerWidthFromOnboardingContext,
    eventCallbacks: eventCallbacksFromOnboarding,
  } = useOnboardingContext();

  const {
    onMdBoxImageElementEnter: onMdBoxImageElementEnterFromOnboarding,
    onMdBoxImageElementLeave: onMdBoxImageElementLeaveFromOnboarding,
  } = eventCallbacksFromOnboarding ?? {};

  const onImageElementEnter =
    props.onImageElementEnter ??
    onImageElementEnterFromEventCallback ??
    onMdBoxImageElementEnterFromOnboarding;

  const onImageElementLeave =
    props.onImageElementLeave ??
    onImageElementLeaveFromEventCallback ??
    onMdBoxImageElementLeaveFromOnboarding;

  const imageAutoSizeContainerWidth =
    imageAutoSizeContainerWidthFromProps ??
    imageAutoSizeContainerWidthFromContext ??
    imageAutoSizeContainerWidthFromOnboardingContext;

  const originImageInfoRef = useRef<OriginImageInfo>({});
  const [imageStyles, setImageStyles] = useState<CSSProperties>({});

  // loading status
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(DefaultImage);

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const resetImageSize = (width: number, height: number) => {
    if (!imageAutoSizeContainerWidth) {
      return;
    }

    const { displayHeight, displayWidth, isCover } = getImageDisplayAttribute(
      width,
      height,
      imageAutoSizeContainerWidth,
    );

    setImageStyles({
      display: 'block',
      width: displayWidth,
      height: displayHeight,
      objectFit: isCover ? 'cover' : undefined,
      objectPosition: 'left top',
    });
  };

  const clearImageErrorTimeout = () => {
    if (!timeout.current) {
      return;
    }

    clearTimeout(timeout.current);
  };

  const builtinLoadImage = ({ loadImageSrc }: { loadImageSrc: string }) => {
    const image = new Image();
    image.src = loadImageSrc;

    clearImageErrorTimeout();

    image.onload = () => {
      clearImageErrorTimeout();
      originImageInfoRef.current = {
        width: image.width,
        height: image.height,
      };
      resetImageSize(image.width, image.height);
      setImageSrc(loadImageSrc);
      setLoading(false);
    };

    image.onerror = () => {
      clearImageErrorTimeout();
      timeout.current = setTimeout(() => {
        setImageSrc(DefaultImage);
        setLoading(false);

        onError?.(new Error('coze image load error: time out'));
      }, TIME_OUT);
    };
  };

  useEffect(() => {
    setLoading(true);

    builtinLoadImage({
      loadImageSrc: src ?? '',
    });
  }, [src]);

  useEffect(() => {
    if (!imageAutoSizeContainerWidth || !originImageInfoRef.current) {
      return;
    }

    if (
      !originImageInfoRef.current.width ||
      !originImageInfoRef.current.height
    ) {
      return;
    }

    resetImageSize(
      originImageInfoRef.current.width,
      originImageInfoRef.current.height,
    );
  }, [imageAutoSizeContainerWidth, originImageInfoRef.current]);

  const handleMouseEnter = () => {
    if (!containerRef.current) {
      return;
    }
    onImageElementEnter?.({
      element: containerRef.current,
      link: src ?? '',
    });
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) {
      return;
    }
    onImageElementLeave?.({
      element: containerRef.current,
      link: src ?? '',
    });
  };

  return (
    <div
      ref={containerRef}
      className={classNames('w-fit', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {enablePreview && src ? (
        <ImagePreview
          src={src ?? ''}
          visible={showPreview}
          onVisibleChange={() => setShowPreview(false)}
        />
      ) : null}
      <Skeleton
        style={{ width: 240, height: 120 }}
        className="coz-mg-secondary"
        loading={loading}
        active
      >
        <img
          src={imageSrc ?? ''}
          style={imageStyles}
          className={classNames('rounded-[8px]', className, {
            'cursor-zoom-in': Boolean(onImageClick) || enablePreview,
          })}
          onClick={e => {
            onImageClick?.(e, {
              src: imageSrc ?? '',
              status: ImageStatus.Success,
            });

            if (enablePreview) {
              setShowPreview(true);
            }
          }}
        />
      </Skeleton>
    </div>
  );
};

export const CozeImage = memo(_CozeImage, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps),
);

export const CozeImageWithPreview: FC<CozeImageProps> = props => (
  <CozeImage {...props} enablePreview={true} />
);

CozeImageWithPreview.displayName = 'CozeImageWithPreview';
