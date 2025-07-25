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
 
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useRef, useState, type FC } from 'react';

import classNames from 'classnames';
import { useMount } from 'ahooks';
import { CommonE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { type FileItem, type UploadProps } from '@coze-arch/bot-semi/Upload';
import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import { UIButton, Toast, withField, Image, Upload } from '@coze-arch/bot-semi';
import { IconAvatarEditMask } from '@coze-arch/bot-icons';
import { type FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import customUploadRequest from './utils/custom-upload-request';

import s from './index.module.less';

export type UploadValue = { uid: string | undefined; url: string }[];
export interface GenerateInfo {
  name: string;
  desc?: string;
}

export interface RenderAutoGenerateParams {
  uploadPicture: () => void;
  showAiAvatar: boolean;
  setShowAiAvatar: (show: boolean) => void;
  generateInfo?: GenerateInfo | (() => GenerateInfo);
  generateTooltip?: {
    generateBtnText?: string;
    contentNotLegalText?: string;
  };
  onChange?: (value: UploadValue) => void;
  maxCandidateCount?: number;
}
interface PackageUploadProps {
  value?: FileItem[];
  onChange?: (value: UploadValue) => void;
  fileBizType: FileBizType;
  uploadButtonText?: string;
  iconType?: IconType;
  disabled?: boolean;
  avatarClassName?: string;
  uploadClassName?: string;
  triggerClassName?: string;
  maskIcon?: React.ReactNode;
  /**
   * 编辑遮罩的展示模式
   * - full-center(默认): 整体覆盖黑色透明遮罩, Icon 居中展示. hover 展示
   * - right-bottom: 右下角遮罩, 长期展示
   */
  maskMode?: 'full-center' | 'right-bottom';
  /** 编辑遮罩的 className */
  editMaskClassName?: string;
  /** max size */
  maxSize?: number;
  withAutoGenerate?: boolean;
  generateInfo?: GenerateInfo | (() => GenerateInfo);
  generateTooltip?: {
    generateBtnText?: string;
    contentNotLegalText?: string;
  };
  /**
   * 自动生成的最大候选数量
   * @default 5
   */
  maxCandidateCount?: number;
  beforeUploadCustom?: () => void;
  afterUploadCustom?: () => void;
  accept?: string;
  onGenerateStaticImageClick?: React.MouseEventHandler<HTMLButtonElement>;
  onGenerateGifClick?: React.MouseEventHandler<HTMLButtonElement>;
  onSizeError?: () => void;
  // 自定义自定生成图片逻辑
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
  testId?: string;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
const _PictureUpload = (props: PackageUploadProps) => {
  //   业务
  const {
    onChange,
    value,
    fileBizType,
    uploadButtonText,
    iconType = IconType.Bot,
    disabled = false,
    avatarClassName,
    uploadClassName,
    triggerClassName,
    maskIcon,
    maskMode = 'full-center',
    editMaskClassName,
    withAutoGenerate = false,
    generateInfo,
    generateTooltip,
    beforeUploadCustom,
    afterUploadCustom,
    accept = 'image/*',
    maxCandidateCount,
    renderAutoGenerate,
    onSizeError,
    maxSize = 2 * 1024,
    testId,
  } = props;
  const uploadRef = useRef<Upload>(null);
  const pictureValue = value?.at(0);
  const [loadingIcon, setLoadingIcon] = useState(!pictureValue);
  const [showAiAvatar, setShowAiAvatar] = useState(withAutoGenerate);
  const maskIconInner = useMemo(() => {
    if (maskIcon) {
      return maskIcon;
    }

    return (
      <IconCozEdit
        className={classNames(
          maskMode === 'right-bottom' ? 'text-[14px]' : 'text-[24px]',
        )}
      />
    );
  }, [maskIcon, maskMode]);

  const getIcon = async () => {
    setLoadingIcon(true);
    try {
      const res = await DeveloperApi.GetIcon({
        icon_type: iconType,
      });
      const iconData = res.data?.icon_list?.[0];
      if (!iconData) {
        Toast.error({
          content: I18n.t('error'),
          showClose: false,
        });
        return;
      }
      const { url = '', uri = '' } = iconData;
      onChange?.([
        {
          url,
          uid: uri,
        },
      ]);
    } catch (e) {
      Toast.error({
        content: I18n.t('error'),
        showClose: false,
      });
    }
  };

  useMount(() => {
    if (!pictureValue) {
      getIcon().then(() => setLoadingIcon(false));
    }
  });

  const customRequest: UploadProps['customRequest'] = options => {
    customUploadRequest({
      ...options,
      fileBizType,
      onSuccess: data => {
        if (withAutoGenerate) {
          setShowAiAvatar(false);
        }
        options.onSuccess(data);
        onChange?.([
          {
            uid: data?.upload_uri || '',
            url: data?.upload_url || '',
          },
        ]);
      },
      beforeUploadCustom,
      afterUploadCustom,
    });
  };

  const uploadPicture = () => {
    uploadRef.current?.openFileDialog();
  };

  return (
    <div
      className={withAutoGenerate ? s['upload-with-auto-generate'] : ''}
      data-testid={CommonE2e.PictureUpload}
    >
      <Upload
        action=""
        className={classNames(s.upload, uploadClassName)}
        limit={1}
        customRequest={customRequest}
        fileList={value}
        accept={accept}
        showReplace={false}
        showUploadList={false}
        ref={uploadRef}
        disabled={disabled}
        maxSize={maxSize}
        onSizeError={() => {
          if (onSizeError) {
            onSizeError();
            return;
          }
          Toast.error({
            // starling 切换
            content: I18n.t(
              'dataset_upload_image_warning',
              {},
              'Please upload an image less than 2MB',
            ),
            showClose: false,
          });
        }}
      >
        <div
          className={classNames(
            s['avatar-wrap'],
            'cursor-pointer',
            triggerClassName,
          )}
          data-testid={testId}
        >
          <Image
            preview={false}
            className={classNames(
              s.avatar,
              loadingIcon && s['avatar-loading'],
              avatarClassName,
            )}
            placeholder={
              <Image
                className={classNames(s.avatar, avatarClassName)}
                src={pictureValue?.url}
                preview={false}
              />
            }
          />
          <div className={classNames(s.mask, s[maskMode], editMaskClassName)}>
            {maskMode === 'right-bottom' && (
              <IconAvatarEditMask className="absolute inset-0 w-full h-full rounded-br-[14px] overflow-hidden" />
            )}
            <div className="relative inline-flex">{maskIconInner}</div>
          </div>
        </div>
      </Upload>
      {uploadButtonText && !disabled ? (
        <div className={s['upload-button-wrap']}>
          <UIButton
            className={s['upload-button']}
            theme="borderless"
            type="primary"
            onClick={uploadPicture}
          >
            {uploadButtonText}
          </UIButton>
        </div>
      ) : null}
      {withAutoGenerate && renderAutoGenerate
        ? renderAutoGenerate({
            uploadPicture,
            showAiAvatar,
            setShowAiAvatar,
            generateInfo,
            generateTooltip,
            onChange,
            maxCandidateCount,
          })
        : null}
    </div>
  );
};
export const PictureUpload: FC<CommonFieldProps & PackageUploadProps> =
  withField(_PictureUpload);
