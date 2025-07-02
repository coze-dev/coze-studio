import { useState, useEffect } from 'react';

import { Input } from '@coze-workflow/test-run/formily';

import { useGlobalState } from '@/hooks';

export const RoleNameInput = ({ value, onChange, onBlur, ...props }) => {
  const [innerValue, setInnerValue] = useState(value);
  const { info } = useGlobalState();

  const handleChange = (val: string) => {
    setInnerValue(val);
  };

  const handleBlur = () => {
    let nextValue = innerValue;
    // 如果用户把角色名称删空了，在失焦之后需要回填原本的值
    if (!nextValue && value) {
      nextValue = value;
    }
    onChange(nextValue);
    setInnerValue(nextValue);
    onBlur();
  };

  useEffect(() => {
    if (value !== innerValue) {
      setInnerValue(value);
    }
  }, [value]);

  return (
    <Input
      value={innerValue}
      placeholder={info?.name}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
};
