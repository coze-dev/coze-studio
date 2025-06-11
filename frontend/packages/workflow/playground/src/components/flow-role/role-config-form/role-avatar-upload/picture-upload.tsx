import { useRef, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type FileItem, type UploadProps } from '@coze-arch/bot-semi/Upload';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { IconCozEdit } from '@coze/coze-design/icons';
import { CozAvatar, Toast, Upload } from '@coze/coze-design';

import { EmptyRoleAvatar } from '../../empty-role-avatar';
import customUploadRequest from './utils/custom-upload-request';
import { AutoGenerate } from './auto-generate';

import s from './index.module.less';

export type UploadValue = { uid: string | undefined; url: string }[];
export interface GenerateInfo {
  name: string;
  desc?: string;
}

interface PackageUploadProps {
  value?: FileItem[];
  onChange?: (value: UploadValue) => void;
  disabled?: boolean;
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
}

export const RoleAvatarUpload = (props: PackageUploadProps) => {
  //   业务
  const {
    onChange,
    value,
    disabled = false,
    generateInfo,
    generateTooltip,
    beforeUploadCustom,
    afterUploadCustom,
    accept = 'image/*',
    maxCandidateCount,
  } = props;
  const uploadRef = useRef<Upload>(null);
  const pictureValue = value?.at(0);
  const [showAiAvatar, setShowAiAvatar] = useState(true);

  const customRequest: UploadProps['customRequest'] = options => {
    customUploadRequest({
      ...options,
      fileBizType: FileBizType.BIZ_BOT_WORKFLOW,
      onSuccess: data => {
        setShowAiAvatar(false);
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

  return (
    <div className={s['upload-with-auto-generate']}>
      <Upload
        action=""
        className={s.upload}
        limit={1}
        customRequest={customRequest}
        fileList={value}
        accept={accept}
        showReplace={false}
        showUploadList={false}
        ref={uploadRef}
        disabled={disabled}
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        maxSize={2 * 1024}
        onSizeError={() => {
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
        <div className={s['avatar-wrap']}>
          {!pictureValue ? (
            <EmptyRoleAvatar width={36} type="platform" />
          ) : (
            <CozAvatar
              src={pictureValue?.url}
              className={s.avatar}
              type="platform"
            />
          )}

          {!disabled && (
            <div className={s.mask}>
              <div className="relative inline-flex">
                <IconCozEdit className="text-[24px]" />
              </div>
            </div>
          )}
        </div>
      </Upload>

      {/* The community version does not support AI-generated avatar, for future expansion */}
      {!disabled && !IS_OPEN_SOURCE ? (
        <AutoGenerate
          generateInfo={generateInfo}
          generateTooltip={generateTooltip}
          showAiAvatar={showAiAvatar}
          onChange={(autoValue?: UploadValue) => {
            setShowAiAvatar(true);
            if (autoValue) {
              onChange?.(autoValue);
            }
          }}
          maxCandidateCount={maxCandidateCount}
        />
      ) : null}
    </div>
  );
};
