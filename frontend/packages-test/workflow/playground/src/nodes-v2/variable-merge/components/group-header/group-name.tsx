import { type FC, useState, useRef } from 'react';

import { Input, type InputProps } from '@coze-arch/coze-design';

import { MAX_GROUP_NAME_COUNT } from '../../constants';

interface Props {
  value?: string;
  onChange: InputProps['onChange'];
  onBlur: InputProps['onBlur'];
  readonly?: boolean;
  disableEdit?: boolean;
}

/**
 * 分组名,支持双击编辑
 * @param props
 * @returns
 */
export const GroupName: FC<Props> = props => {
  const { value, onChange, readonly, disableEdit, onBlur } = props;

  const [isEdit, setIsEdit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (readonly || disableEdit) {
      return;
    }

    setIsEdit(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleBlur = e => {
    onBlur?.(e);
    setIsEdit(false);
  };

  if (isEdit) {
    return (
      <Input
        value={value}
        ref={inputRef}
        onBlur={handleBlur}
        onChange={onChange}
        size="small"
        className="w-full"
        maxLength={MAX_GROUP_NAME_COUNT}
      />
    );
  } else {
    return (
      <div
        className="text-xs font-medium coz-fg-primary hover:coz-mg-secondary-hovered cursor-pointer p-0.5 rounded-[4px] truncate"
        onClick={handleClick}
      >
        {value}
      </div>
    );
  }
};
