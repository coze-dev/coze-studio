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

import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';
import { ThemeExtension } from '@coze-common/editor-plugins/theme';
import {
  PromptEditorRender,
  type PromptEditorRenderProps,
} from '@coze-common/prompt-kit-base/editor';
import { EditorView } from '@codemirror/view';

import { WORKFLOW_PLAYGROUND_CONTENT_ID } from '@/constants';

interface EditorWithPromptKitProps extends PromptEditorRenderProps {
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

export const SystemPromptEditor: FC<EditorWithPromptKitProps> = props => {
  const {
    readonly,
    placeholder,
    defaultValue,
    value,
    onChange,
    isControled,
    wrapperClassName = '',
    wrapperStyle,
    dataTestID,
    onFocus,
    onBlur,
  } = props;

  const [isFocused, setIsFocused] = useState(false);

  const handleOnFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleOnBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <Tooltip
      content={I18n.t('db_table_0129_003')}
      trigger="custom"
      position="top"
      autoAdjustOverflow={false}
      visible={isFocused && readonly}
      getPopupContainer={() =>
        document.getElementById(WORKFLOW_PLAYGROUND_CONTENT_ID) ?? document.body
      }
    >
      <div
        className={wrapperClassName}
        style={wrapperStyle}
        onMouseEnter={() => {
          setIsFocused(true);
        }}
        onMouseLeave={() => {
          setIsFocused(false);
        }}
      >
        <PromptEditorRender
          defaultValue={defaultValue ?? value}
          value={value}
          onChange={onChange}
          readonly={readonly}
          placeholder={placeholder}
          options={{
            minHeight: 112,
            fontSize: 12,
          }}
          dataTestID={dataTestID}
          isControled={isControled}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
        <ThemeExtension
          themes={[
            EditorView.theme({
              '.cm-line': {
                lineHeight: '18px !important',
              },
            }),
          ]}
        />
      </div>
    </Tooltip>
  );
};
