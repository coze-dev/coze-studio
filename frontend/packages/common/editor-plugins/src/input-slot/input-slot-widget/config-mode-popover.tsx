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

import { useEffect, useState } from 'react';

import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { type ViewUpdate } from '@codemirror/view';

import { InputConfigPopover } from '../input-config-popover';
import { type TemplateParser } from '../../shared/utils/template-parser';

export const ConfigModeWidgetPopover = (props: {
  direction: 'bottomLeft' | 'topLeft' | 'bottomRight' | 'topRight';
  templateParser: TemplateParser;
}) => {
  const { direction, templateParser } = props;
  const editor = useEditor<EditorAPI>();
  const [placeholder, setPlaceholder] = useState('');
  const [value, setValue] = useState('');
  const [configPopoverVisible, setConfigPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(-1);
  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleViewUpdate = (e: ViewUpdate) => {
      if (e.docChanged) {
        // Determine whether the current cursor is in the slot node
        const { state } = e;
        const range = templateParser.getCursorInMarkNodeRange(state);
        if (!range) {
          return;
        }
        const content = state.sliceDoc(range.open.to, range.close.from);
        if (content === value) {
          return;
        }
        setValue(content);
      }
      if (e.selectionSet) {
        const { state } = e;
        const range = templateParser.getCursorInMarkNodeRange(state);
        if (!range) {
          setPopoverPosition(-1);
          setConfigPopoverVisible(false);
          return;
        }
        const content = templateParser.getCursorTemplateContent(editor);
        const { placeholder: configPlaceholder } =
          templateParser.getCursorTemplateData(state) ?? {};
        setPlaceholder(configPlaceholder);
        setValue(content ?? '');
        setPopoverPosition(range.open.from);
        setConfigPopoverVisible(true);
      }
    };
    editor.$on('viewUpdate', handleViewUpdate);

    return () => {
      editor.$off('viewUpdate', handleViewUpdate);
    };
  }, [editor, value]);

  const handlePlaceholderChange = (configPlaceholder: string) => {
    if (!editor || !configPopoverVisible) {
      return;
    }
    setPlaceholder(configPlaceholder);
    templateParser.updateCursorTemplateData(editor, {
      placeholder: configPlaceholder,
    });
  };
  const handleValueChange = (configValue: string) => {
    if (!editor || !configPopoverVisible) {
      return;
    }
    setValue(configValue);
    templateParser.updateCursorTemplateContent(editor, configValue);
  };

  return (
    <InputConfigPopover
      visible={configPopoverVisible}
      positon={popoverPosition}
      direction={direction}
      placeholder={placeholder}
      value={value}
      onPlaceholderChange={handlePlaceholderChange}
      onValueChange={handleValueChange}
    />
  );
};
