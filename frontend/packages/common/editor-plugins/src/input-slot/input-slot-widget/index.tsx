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

import { ConfigModeWidgetPopover } from './config-mode-popover';

import './index.css';
import { useEffect, useLayoutEffect } from 'react';

import { useEditor, useInjector } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import {
  astDecorator,
  SpanWidget,
  autoSelectRanges,
  selectionEnlarger,
  deletionEnlarger,
} from '@coze-editor/editor';
import { type ViewUpdate } from '@codemirror/view';

import {
  type MarkRangeInfo,
  TemplateParser,
} from '../../shared/utils/template-parser';
import { useReadonly } from '../../shared/hooks/use-editor-readonly';
interface InputSlotWidgetProps {
  mode?: 'input' | 'configurable';
  onSelectionInInputSlot?: (selection: MarkRangeInfo | undefined) => void;
}

const templateParser = new TemplateParser({ mark: 'InputSlot' });

export const InputSlotWidget = (props: InputSlotWidgetProps) => {
  const { mode, onSelectionInInputSlot } = props;
  const injector = useInjector();
  const editor = useEditor<EditorAPI>();
  const readonly = useReadonly();

  useLayoutEffect(() => {
    const { markInfoField } = templateParser;

    return injector.inject([
      astDecorator.whole.of((cursor, state) => {
        if (templateParser.isOpenNode(cursor.node, state)) {
          const open = cursor.node;
          const close = templateParser.findCloseNode(open, state);

          if (close) {
            const openTemplate = state.sliceDoc(open.from, open.to);
            const data = templateParser.getData(openTemplate);
            const from = open.to;
            const to = close.from;

            if (from === to) {
              return [
                {
                  type: 'replace',
                  widget: new SpanWidget({
                    className: 'slot-side-left',
                  }),
                  atomicRange: true,
                  from: open.from,
                  to: open.to,
                },
                {
                  type: 'widget',
                  widget: new SpanWidget({
                    text: data?.placeholder || '',
                    className: 'slot-placeholder',
                  }),
                  from,
                  atomicRange: true,
                  side: 1,
                },
                {
                  type: 'replace',
                  widget: new SpanWidget({
                    className: 'slot-side-right',
                  }),
                  atomicRange: true,
                  from: close.from,
                  to: close.to,
                },
              ];
            }
            return [
              {
                type: 'replace',
                widget: new SpanWidget({
                  className: 'slot-side-left',
                }),
                atomicRange: true,
                from: open.from,
                to: open.to,
              },
              {
                type: 'className',
                className: 'slot-content',
                from,
                to,
              },
              {
                type: 'replace',
                widget: new SpanWidget({ className: 'slot-side-right' }),
                atomicRange: true,
                from: close.from,
                to: close.to,
              },
            ];
          }
        }
      }),

      markInfoField,

      autoSelectRanges.of(state => state.field(markInfoField).contents),

      selectionEnlarger.of(state => state.field(markInfoField).specs),

      deletionEnlarger.of(state => state.field(markInfoField).specs),
    ]);
  }, [injector]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleViewUpdate = (update: ViewUpdate) => {
      if (!update.state.selection.main.empty) {
        const markRangeInfo = templateParser.getSelectionInMarkNodeRange(
          update.state.selection.main,
          update.state,
        );
        if (markRangeInfo) {
          onSelectionInInputSlot?.(markRangeInfo);
          return;
        }
        onSelectionInInputSlot?.(undefined);
      }
    };
    editor.$on('viewUpdate', handleViewUpdate);
    return () => {
      editor.$off('viewUpdate', handleViewUpdate);
    };
  }, [editor]);

  if (mode === 'configurable' && !readonly) {
    return (
      <ConfigModeWidgetPopover
        direction="bottomLeft"
        templateParser={templateParser}
      />
    );
  }

  return null;
};
