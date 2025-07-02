/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from 'react';

import { TextArea, withField } from '@coze-arch/coze-design';

import {
  type EditorInputProps,
  type EditorHandle,
  type Editor,
  type Delta,
} from './types';

export const EditorFullInputInner = forwardRef<EditorHandle, EditorInputProps>(
  (props: EditorInputProps, ref) => {
    const {
      value: propsValue,
      onChange: propsOnChange,
      getEditor,
      ...restProps
    } = props;
    const [value, setValue] = useState(propsValue);

    // 创建一个可变引用以存储最新的value值
    const valueRef = useRef(value);

    // 当value更新时，同步更新valueRef
    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const editorRef = useRef<Editor>({
      setHTML: (htmlContent: string) => {
        setValue(htmlContent);
      },
      setText: (text: string) => {
        setValue(text);
      },
      setContent: (content: { deltas: Delta[] }) => {
        setValue(content.deltas[0].insert);
      },
      getContent: () => ({
        deltas: [{ insert: valueRef.current ?? '' }],
      }),
      getText: () => valueRef.current || '',
      getRootContainer: () => null,
      getContentState: () => ({
        getZoneState: (zone: any) => null,
      }),
      selection: {
        getSelection: () => ({
          start: 0,
          end: 0,
          zoneId: '0',
        }),
      },
      registerCommand: () => null,
      scrollModule: {
        scrollTo: () => null,
      },
      on: () => null,
    });

    useImperativeHandle(ref, () => ({
      setDeltaContent(delta) {
        editorRef.current && delta && editorRef.current.setContent(delta);
      },
      getEditor() {
        return editorRef.current;
      },
      getMarkdown() {
        return editorRef.current?.getText() || '';
      },
    }));

    useEffect(() => {
      getEditor?.(editorRef.current);
    }, [getEditor]);

    return (
      <TextArea
        {...restProps}
        value={value}
        onChange={v => {
          setValue(v);
          propsOnChange?.(v);
        }}
      />
    );
  },
);

export const EditorInput: typeof EditorFullInputInner = withField(
  EditorFullInputInner,
  {
    valueKey: 'value',
    onKeyChangeFnName: 'onChange',
  },
);
