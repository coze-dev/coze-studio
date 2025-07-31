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

import { useState, type ComponentProps, type PropsWithChildren } from 'react';

import { Form, Popover, UIButton, UIInput } from '@coze-arch/bot-semi';

import styles from './index.module.less';

export interface InsertLinkPopoverProps
  extends Pick<ComponentProps<typeof Popover>, 'onClickOutSide' | 'visible'> {
  onConfirm?: (param: { link: string; text: string }) => void;
}

/**
 * fully controlled
 */
export const InsertLinkPopover: React.FC<
  PropsWithChildren<InsertLinkPopoverProps>
> = ({ children, visible, onClickOutSide, onConfirm }) => (
  <Popover
    trigger="custom"
    visible={visible}
    onClickOutSide={onClickOutSide}
    showArrow={false}
    position="topRight"
    content={<Content onConfirm={onConfirm} />}
  >
    {children}
  </Popover>
);

const Content: React.FC<Pick<InsertLinkPopoverProps, 'onConfirm'>> = ({
  onConfirm: inputOnConfirm,
}) => {
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const onConfirm = () => {
    clearInput();
    inputOnConfirm?.({ text, link });
  };
  const clearInput = () => {
    setLink('');
    setText('');
  };
  return (
    <div className={styles['popover-content']}>
      <div className={styles['input-content']}>
        <div className={styles['input-row']}>
          <Form.Label required text="Text" />
          <UIInput value={text} onChange={setText} />
        </div>
        <div className={styles['input-row']}>
          <Form.Label required text="Link" />
          <UIInput value={link} onChange={setLink} />
        </div>
      </div>
      <UIButton
        onClick={onConfirm}
        disabled={!text || !link}
        theme="solid"
        className={styles['confirm-button']}
      >
        Confirm
      </UIButton>
    </div>
  );
};
