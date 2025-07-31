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

import { useState, useRef, useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Typography, Input, Button } from '@coze-arch/coze-design';

import styles from './style.module.less';

const MAX_INPUT_LENGTH = 20;

interface SlotNodeProps {
  placeholder?: string;
  dropdownVisible?: boolean;
  /** When allowing custom addition (enableCustom is true), add option events */
  onAdd?: (value: string) => Promise<boolean>;
}

export function useSlotNode({
  onAdd,
  placeholder,
  dropdownVisible,
}: SlotNodeProps) {
  /** When allowing custom addition, whether the current state is added */
  const [showCustomise, setShowCustomise] = useState(false);

  /** Record the current input value */
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  /** handle add */
  const handleAdd = async (input: string) => {
    await onAdd?.(input).then(isSuccess => {
      if (isSuccess) {
        setInputValue('');
      }
    });
  };

  useEffect(() => {
    if (!dropdownVisible) {
      setShowCustomise(false);
    }
  }, [dropdownVisible]);

  const outSlotNode = (
    <>
      {!showCustomise ? (
        <div
          className={styles['customise-button']}
          onClick={() => {
            setShowCustomise(true);
            setTimeout(() => {
              inputRef?.current?.focus();
            }, 100);
          }}
        >
          <IconCozPlus />
          <Typography.Text>
            {I18n.t('workflow_stringprocess_concat_symbol_custom')}
          </Typography.Text>
        </div>
      ) : (
        <div className="flex bg-white p-[4px] items-center">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onEnterPress={() => handleAdd(inputValue)}
              onChange={v => setInputValue(v)}
              className="rounded-[8px]"
              placeholder={placeholder}
              maxLength={MAX_INPUT_LENGTH}
            />
          </div>
          <div className="flex p-[2px]">
            <Button
              color="secondary"
              className={styles['action-cancel-button']}
              onClick={() => {
                setShowCustomise(false);
              }}
            >
              {I18n.t('workflow_240218_17')}
            </Button>
            <Button
              color="brand"
              className={styles['action-main-button']}
              onClick={() => handleAdd(inputValue)}
            >
              {I18n.t('workflow_240218_18')}
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return {
    node: outSlotNode,
  };
}
