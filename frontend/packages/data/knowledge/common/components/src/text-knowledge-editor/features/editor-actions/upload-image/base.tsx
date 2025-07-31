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
  // Handle image upload
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
            // Insert pictures into the editor
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
