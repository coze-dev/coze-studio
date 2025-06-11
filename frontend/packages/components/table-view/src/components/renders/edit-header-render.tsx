import { useMemo, useState } from 'react';

import { Tooltip, UIButton, UIInput } from '@coze-arch/bot-semi';
import { IconDeleteOutline, IconToastError } from '@coze-arch/bot-icons';

import { type ValidatorProps } from '../types';

import styles from './index.module.less';
export interface EditHeaderRenderProps {
  value: string;
  deleteProps?: {
    // 禁用删除
    disabled: boolean;
    // 删除回调
    onDelete?: (v: string) => void;
  };
  editProps?: {
    // 编辑回调
    onChange?: (v: string) => void;
    // 失焦回调
    onBlur?: (v: string) => void;
  };
  // 失焦回调
  onBlur: (v: string) => void;
  // 表头校验逻辑
  validator: ValidatorProps;
  editable?: boolean;
}

export const EditHeaderRender = ({
  value,
  validator = {},
  deleteProps = { disabled: false },
  editProps = {},
  editable = true,
}: EditHeaderRenderProps) => {
  const { validate, errorMsg } = validator;

  const { onChange, onBlur } = editProps;
  const { disabled: deleteDisabled, onDelete } = deleteProps;

  const [isEditCom, setIsEditCom] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [readonly, setReadonly] = useState(true);

  const onBlurFn = () => {
    if (onBlur) {
      onBlur(inputValue);
    }
    setReadonly(true);
    setIsEditCom(false);
  };
  const onChangeFn = (v: string) => {
    if (onChange) {
      onChange(v);
    }
    setInputValue(v);
  };
  const isError = useMemo(() => validate && validate(value), [inputValue]);
  return (
    <div className={styles['edit-header-render']}>
      {/* 编辑态组件 */}
      {isEditCom && (
        <UIInput
          autoFocus
          readonly={readonly}
          validateStatus={isError ? 'error' : 'default'}
          suffix={
            isError ? (
              <Tooltip content={errorMsg}>
                <IconToastError />
              </Tooltip>
            ) : null
          }
          className={styles['header-input']}
          value={inputValue}
          onClick={() => {
            if (editable) {
              setReadonly(false);
            }
          }}
          onBlur={onBlurFn}
          onChange={onChangeFn}
        />
      )}

      {/* 预览态组件 */}
      {!isEditCom && (
        <div
          className={styles['header-preview']}
          onClick={() => setIsEditCom(true)}
        >
          {inputValue}
        </div>
      )}

      {/* 列删除按钮 */}
      {editable && (
        <UIButton
          disabled={deleteDisabled}
          icon={<IconDeleteOutline />}
          className={styles['header-delete']}
          onClick={() => onDelete && onDelete(inputValue)}
        ></UIButton>
      )}
    </div>
  );
};
