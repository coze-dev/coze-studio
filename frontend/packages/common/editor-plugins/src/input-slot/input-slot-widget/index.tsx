import { ConfigModeWidgetPopover } from './config-mode-popover';

import './index.css';
import { useEffect, useLayoutEffect } from 'react';

import { useEditor, useInjector } from '@flow-lang-sdk/editor/react';
import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';
import {
  astDecorator,
  SpanWidget,
  autoSelectRanges,
  selectionEnlarger,
  deletionEnlarger,
} from '@flow-lang-sdk/editor';
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
