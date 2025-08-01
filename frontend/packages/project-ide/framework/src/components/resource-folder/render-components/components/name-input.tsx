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

import React, { useEffect, useRef, useState } from 'react';

import { Input } from '@coze-arch/coze-design';

import { type CommonComponentProps } from '../../type';
import { MOUSEUP_IGNORE_CLASS_NAME } from '../../constant';

const DATASET_PARENT_DATA_KEY_ID = 'name_input_wrapper';

const isClickOutside = (elm, deep = 0) => {
  if (!elm || deep > 10) {
    return true;
  }

  if (elm.dataset?.[DATASET_PARENT_DATA_KEY_ID] !== undefined) {
    return false;
  }

  return isClickOutside(elm.parentElement, deep + 1);
};

const NameInput = ({
  resource,
  initValue,
  handleSave: onSave,
  handleChangeName,
  errorMsg,
  errorMsgRef,
  validateConfig,
  config,
}: { initValue: string } & Pick<
  CommonComponentProps,
  | 'resource'
  | 'handleSave'
  | 'handleChangeName'
  | 'errorMsg'
  | 'errorMsgRef'
  | 'validateConfig'
  | 'config'
>) => {
  const [value, setValue] = useState(initValue);

  const ref = useRef(null);

  const handleSave = () => {
    onSave(errorMsgRef?.current ? initValue : undefined);
  };

  const loaded = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      loaded.current = true;
    }, 0);

    const handleBlur = (e: MouseEvent) => {
      const clickOutside = isClickOutside(e.target);
      if (clickOutside) {
        handleSave();
      }
    };
    window.addEventListener('mousedown', handleBlur, true);
    return () => {
      window.removeEventListener('mousedown', handleBlur, true);
    };
  }, []);

  return (
    <div
      {...{
        [`data-${DATASET_PARENT_DATA_KEY_ID}`]: true,
      }}
      className={`base-item-name-input ${MOUSEUP_IGNORE_CLASS_NAME} ${
        errorMsg ? 'base-item-name-input-error' : ''
      }`}
      style={{ width: '100%' }}
    >
      <Input
        className={config?.input?.className || ''}
        style={{ padding: 0, ...config?.input?.style }}
        ref={ref}
        placeholder={config?.input?.placeholder}
        onMouseDown={e => {
          e.stopPropagation();
        }}
        onKeyDown={e => {
          e.stopPropagation();

          if (e.code === 'Escape') {
            onSave('');
          }
        }}
        onEnterPress={e => {
          if (!loaded.current) {
            return;
          }
          e.stopPropagation();
          e.preventDefault();
          handleSave();
        }}
        onChange={v => {
          setValue(v);
          handleChangeName(v);
        }}
        value={value}
        autoFocus
      />
      {errorMsg ? (
        validateConfig?.errorMsgRender ? (
          validateConfig?.errorMsgRender?.(errorMsg, resource)
        ) : (
          <div
            style={validateConfig?.errorMsgStyle || {}}
            className={`base-item-name-input-error-msg-absolute ${validateConfig?.errorMsgClassName}`}
          >
            {errorMsg}
          </div>
        )
      ) : null}
    </div>
  );
};
export { NameInput };
