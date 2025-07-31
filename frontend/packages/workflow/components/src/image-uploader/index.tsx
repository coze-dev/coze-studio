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

/* eslint-disable @coze-arch/max-line-per-function */
import {
  type CSSProperties,
  type FC,
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';

import classNames from 'classnames';
import { useBoolean } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozTrashCan,
  IconCozRefresh,
  IconCozUpload,
  IconCozImageBroken,
} from '@coze-arch/coze-design/icons';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { Image, ImagePreview, Popover, Space, Spin } from '@coze-arch/bot-semi';

import useImageUploader from './use-image-uploader';
import { type ImageRule, ImgUploadErrNo } from './image-uploader';

import s from './index.module.less';

interface ImageUploaderProps {
  className?: string;
  style?: CSSProperties;
  readonly?: boolean;
  disabled?: boolean;
  /** image upload restrictions */
  rules?: ImageRule;
  value?: { url: string; uri: string } | undefined;
  validateStatus?: SelectProps['validateStatus'];
  onChange?: (value?: { uri: string; url: string }) => void;
  onBlur?: () => void;
}

interface ImagePopoverWrapperProps {
  /** Image address */
  url?: string;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  /** Whether to support preview */
  enablePreview?: boolean;
  children?: React.ReactElement;
}

const ImagePopoverWrapper: FC<ImagePopoverWrapperProps> = ({
  url,
  children,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  enablePreview,
}) => {
  const [visible, { setTrue: showImagePreview, setFalse: closeImagePreview }] =
    useBoolean(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [url]);

  if (!url) {
    return children || null;
  }
  const content = loadError ? (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: 225, height: 125 }}
    >
      <IconCozImageBroken className="w-8 coz-fg-dim" />
      <div className="mt-1 coz-fg-primary text-sm font-medium">
        {I18n.t('inifinit_list_load_fail')}
      </div>
    </div>
  ) : (
    <div
      className={classNames(
        'flex flex-col items-center justify-center rounded-lg overflow-hidden',
        enablePreview && !loadError ? 'cursor-zoom-in' : 'cursor-default',
      )}
      style={{
        minWidth,
        minHeight,
        background: 'rgba(46, 46, 56, 0.08)',
      }}
      onClick={() => {
        if (loadError) {
          return;
        }
        showImagePreview();
      }}
    >
      <img
        className={classNames('object-contain object-center rounded-sm')}
        style={{ maxWidth, maxHeight }}
        src={url}
        alt=""
        onLoad={() => {
          setLoadError(false);
        }}
        onError={() => {
          setLoadError(true);
        }}
      />
    </div>
  );

  return (
    <>
      <Popover
        className={s['img-popover-content']}
        content={content}
        showArrow
        position="top"
      >
        {children}
      </Popover>
      {enablePreview ? (
        <ImagePreview
          src={url}
          visible={visible}
          onVisibleChange={closeImagePreview}
          getPopupContainer={() => document.body}
        />
      ) : null}
    </>
  );
};

const ImageUploaderBtn: FC<{
  visible?: boolean;
  disabled?: boolean;
  children?: React.ReactElement;
  onClick?: () => void;
}> = ({ visible = true, disabled = false, onClick, children }) => {
  if (!visible) {
    return null;
  }
  return (
    <div
      className={classNames(s.action, disabled && s.disabled)}
      onClick={e => {
        if (disabled) {
          return;
        }
        e.stopPropagation();

        onClick?.();
      }}
    >
      {children}
    </div>
  );
};

const ImageUploader: FC<ImageUploaderProps> = ({
  className,
  style,
  value,
  rules,
  onChange,
  onBlur,
  disabled = false,
  readonly = false,
  validateStatus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    uri,
    url,
    fileName,
    isError,
    loading,
    setImgValue,
    uploadImg,
    clearImg,
    retryUploadImg,
  } = useImageUploader({
    rules,
  });
  const acceptAttr = useMemo(() => {
    if ((rules?.suffix || []).length > 0) {
      return (rules?.suffix || []).map(item => `.${item}`).join(',');
    }
    return 'image/*';
  }, [rules?.suffix]);

  /** Overall Area Support Interaction */
  const wrapCanAction = useMemo(
    () => !uri && !loading && !isError && !disabled && !readonly,
    [uri, loading, isError, disabled, readonly],
  );

  useEffect(() => {
    setImgValue({ uri: value?.uri, url: value?.url });
  }, [value?.uri, value?.url]);

  const selectImage = () => {
    if (loading || disabled || !inputRef.current || readonly || isError) {
      return;
    }

    inputRef.current.click();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Spin
            style={{ width: 20, height: 20, lineHeight: '20px' }}
            spinning
          />
          <span
            className="truncate min-w-0 ml-1"
            style={{ color: 'rgba(29, 28, 35, 0.35)' }}
          >
            {I18n.t('datasets_unit_upload_state')}
          </span>
        </>
      );
    }
    if (isError) {
      return (
        <span
          className="truncate min-w-0"
          style={{ color: 'rgba(29, 28, 35, 0.35)' }}
          title={fileName}
        >
          {fileName || I18n.t('Upload_failed')}
        </span>
      );
    }
    if (url) {
      return (
        <>
          {/* <div
            className="inline-flex items-center justify-center flex-shrink-0 flex-grow-0 overflow-hidden rounded-sm"
            style={{ width: 20, height: 20 }}
          >
            <img
              className="object-contain object-center rounded-sm max-w-full max-h-full"
              src={url}
              alt="img"
            />
          </div> */}
          <Image
            className={classNames(s['input-img-thumb'])}
            src={url}
            alt="img"
            preview={false}
            fallback={<IconCozImageBroken />}
          />
          <div className="truncate min-w-0 ml-1" title={fileName}>
            {fileName}
          </div>
        </>
      );
    }
    return (
      <span
        className="truncate min-w-0"
        style={{ color: 'rgba(29, 28, 35, 0.35)' }}
      >
        {I18n.t('imageflow_input_upload_placeholder')}
      </span>
    );
  };

  return (
    <div
      className={classNames(
        s['image-uploader'],
        'semi-input-wrapper  semi-input-wrapper-default',
        'min-w-0 cursor-default',
        (isError || validateStatus === 'error') && 'semi-input-wrapper-error',
        wrapCanAction && s['can-action'],
        className,
      )}
      style={style}
    >
      <ImagePopoverWrapper
        url={url}
        minWidth={100}
        minHeight={75}
        maxWidth={400}
        maxHeight={300}
        enablePreview
      >
        <div
          className={classNames(
            'semi-input',
            'flex items-center h-full',
            !uri &&
              !loading &&
              !isError &&
              !disabled &&
              !readonly &&
              'cursor-pointer',
          )}
          style={{ paddingRight: 6 }}
          onClick={e => {
            e.stopPropagation();
            if (wrapCanAction) {
              selectImage();
            }
          }}
        >
          <>{renderContent()}</>
          <div className="flex-1" />
          {!readonly && (
            <Space spacing={4}>
              <ImageUploaderBtn
                visible={!uri && !loading && !isError}
                disabled={disabled}
                onClick={selectImage}
              >
                <IconCozUpload />
              </ImageUploaderBtn>

              <ImageUploaderBtn
                visible={isError}
                disabled={disabled}
                onClick={async () => {
                  const result = await retryUploadImg();
                  if (result?.isSuccess) {
                    onChange?.({ uri: result.uri, url: result.url });
                  }
                  onBlur?.();
                }}
              >
                <IconCozRefresh />
              </ImageUploaderBtn>

              <ImageUploaderBtn
                visible={Boolean(uri || url)}
                disabled={disabled}
                onClick={() => {
                  clearImg();
                  onChange?.();
                  onBlur?.();
                }}
              >
                <IconCozTrashCan />
              </ImageUploaderBtn>
            </Space>
          )}
        </div>
      </ImagePopoverWrapper>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptAttr}
        onChange={async e => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) {
            const result = await uploadImg(file);
            if (result?.isSuccess) {
              onChange?.({ uri: result.uri, url: result.url });
            }
          }
        }}
      />
    </div>
  );
};

export default ImageUploader;
export { ImgUploadErrNo, ImageRule, useImageUploader, ImageUploader };
