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

import { useState, useEffect, useRef, Suspense } from 'react';

import { nanoid } from 'nanoid';
import cls from 'classnames';
import { connect, mapProps } from '@formily/react';
import type { Editor } from '@coze-common/md-editor-adapter';
import {
  delta2md,
  md2html,
  LazyEditorFullInputInner,
  ToolbarItemEnum,
} from '@coze-common/md-editor-adapter';
import { Modal } from '@coze-arch/coze-design';

import css from './full-input.module.less';

export interface InnerFullInputProps {
  value?: string;
  disabled?: boolean;
  /** Whether it can be expanded, the default is true. */
  expand?: boolean;
  className?: string;
  onChange: (v?: string) => void;
  onExpand?: () => void;
}

export type FullInputProps = InnerFullInputProps & {
  modalTitle?: string;
};

const InnerFullInputAdapter: React.FC<FullInputProps> = ({
  className,
  disabled,
  expand = true,
  value,
  onChange,
  ...props
}) => {
  const editorRef = useRef<Editor | null>(null);
  const businessKeyRef = useRef(nanoid());
  const innerValueRef = useRef<string | undefined>();

  const handleChange = (v: string) => {
    if (!editorRef.current) {
      return;
    }
    /**
     * deltas => md
     */
    const content = editorRef.current.getContent();
    const { markdown } = delta2md(content.deltas[0], content.deltas);
    /**
     * Changes may come from user input or initialization, do a diff to ensure performance
     */
    if (markdown !== innerValueRef.current) {
      innerValueRef.current = markdown;
      onChange(markdown);
    }
  };

  useEffect(() => {
    if (value !== innerValueRef.current) {
      innerValueRef.current = value || '';
      /**
       * md => html
       */
      editorRef.current?.setHTML(md2html(value || ''));
    }
  }, [value]);

  return (
    <Suspense fallback={null}>
      <LazyEditorFullInputInner
        field="full-input"
        className={cls(css['full-input'], className)}
        businessKey={businessKeyRef.current}
        noToolbar={disabled}
        noExpand={!expand}
        getEditor={editor => {
          editorRef.current = editor;
        }}
        disabled={disabled}
        onChange={handleChange}
        registerToolItem={items =>
          items
            .filter(i => (i as any)?.type !== ToolbarItemEnum.Image)
            .map(i => {
              const item = i as any;
              if (item?.type && item.extraPropsToBuiltinComp) {
                item.extraPropsToBuiltinComp = {
                  ...item.extraPropsToBuiltinComp,
                  size: 'extra-small',
                };
              }
              return item;
            })
        }
        {...props}
      />
    </Suspense>
  );
};

const FullInputAdapter: React.FC<FullInputProps> = ({
  expand,
  modalTitle,
  ...props
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Modal
        visible={modalVisible}
        centered
        title={modalTitle}
        onCancel={() => setModalVisible(false)}
      >
        <InnerFullInputAdapter
          expand={false}
          className={css['modal-full-input']}
          {...props}
        />
      </Modal>
      <InnerFullInputAdapter
        expand={expand}
        onExpand={() => setModalVisible(true)}
        {...props}
      />
    </>
  );
};

export const FullInput = connect(
  FullInputAdapter,
  mapProps({ validateStatus: true }),
);
