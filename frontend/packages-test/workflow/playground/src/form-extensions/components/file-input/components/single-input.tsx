import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozUpload, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import { FileIcon } from '@/components/file-icon';

import { useUploadContext } from '../upload-context';
import { ImgPreviewPopover } from './img-preview-popover';
import { FileUploadBtn } from './file-upload-btn';
import { FileTag } from './file-tag';
const { Text } = Typography;

export const SingleInputNew = () => {
  const { fileList, triggerUpload, handleDelete, isImage } = useUploadContext();

  const value = fileList[0];

  return (
    <ImgPreviewPopover file={value}>
      <div
        className={classNames('w-full h-full flex items-center', {
          'cursor-pointer': !value,
        })}
        onClick={() => {
          if (!value) {
            triggerUpload();
          }
        }}
      >
        {value ? (
          <FileTag
            value={value}
            onClose={e => {
              handleDelete(value.uid);
              e.stopPropagation();
            }}
          />
        ) : (
          <FileUploadBtn isImage={isImage} />
        )}
      </div>
    </ImgPreviewPopover>
  );
};

export const SingleInput = () => {
  const { fileList, triggerUpload, handleDelete, isImage } = useUploadContext();

  const value = fileList[0];

  const renderText = () => {
    if (value) {
      return (
        <Text
          ellipsis={{ pos: 'middle', showTooltip: true }}
          className="break-words flex-1 text-xs"
        >
          {value?.name}
        </Text>
      );
    }

    return (
      <span className="text-[#1d1c2359] flex-1 text-xs">
        {isImage
          ? I18n.t('imageflow_input_upload_placeholder')
          : I18n.t('plugin_file_upload')}
      </span>
    );
  };

  return (
    <ImgPreviewPopover file={value}>
      <div
        className={classNames('w-full h-full', {
          'cursor-pointer': !value,
        })}
        onClick={() => {
          if (!value) {
            triggerUpload();
          }
        }}
      >
        <div className="flex items-center space-x-1 h-full">
          {value ? <FileIcon file={value} size={16} /> : null}

          {renderText()}

          <div
            className={classNames(
              'w-5 h-5',
              'rounded-[4px]',
              'flex items-center justify-center',
              'hover:bg-[#0607091A]  text-[--semi-color-text-2]',
              'cursor-pointer',
            )}
          >
            {value ? (
              <IconCozTrashCan
                className="text-sm"
                onClick={e => {
                  handleDelete(value.uid);
                  e.stopPropagation();
                }}
              />
            ) : (
              <IconCozUpload className="text-sm" />
            )}
          </div>
        </div>
      </div>
    </ImgPreviewPopover>
  );
};
