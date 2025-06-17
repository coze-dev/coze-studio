import React from 'react';

import { type Editor } from '@tiptap/react';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, type customRequestArgs } from '@coze-arch/coze-design';

import { type EditorActionProps } from '../module';
import { CustomUpload, handleCustomUploadRequest } from './custom-upload';

export interface BaseUploadImageProps extends EditorActionProps {
  editor: Editor | null;
  renderUI: (props: {
    disabled?: boolean;
    showTooltip?: boolean;
  }) => React.ReactNode;
}

export const BaseUploadImage = ({
  editor,
  disabled,
  showTooltip,
  renderUI,
}: BaseUploadImageProps) => {
  // 处理图片上传
  const handleImageUpload = (object: customRequestArgs) => {
    if (!editor) {
      return;
    }

    const { fileInstance } = object;
    if (!fileInstance) {
      return;
    }

    return handleCustomUploadRequest({
      object,
      options: {
        onFinish: (result: { url?: string; tosKey?: string }) => {
          if (result.url && editor) {
            // 插入图片到编辑器
            editor.chain().focus().setImage({ src: result.url }).run();
          }
        },
      },
    });
  };
  const TooltipWrapper = showTooltip ? Tooltip : React.Fragment;

  return (
    <CustomUpload customRequest={handleImageUpload}>
      <TooltipWrapper
        content={I18n.t('knowledge_insert_img_002')}
        clickToHide
        autoAdjustOverflow
      >
        {renderUI({ disabled, showTooltip })}
      </TooltipWrapper>
    </CustomUpload>
  );
};
