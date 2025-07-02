import { useEffect, useState, type ComponentProps } from 'react';

import { withField, FormInput, FormTextArea } from '@coze-arch/coze-design';

interface PromptInfoInputProps {
  readonly?: boolean;
  initCount?: number;
  value?: string;
  disabled?: boolean;
  rows?: number;
  field: string;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  maxCount?: number;
  rules?: ComponentProps<typeof FormInput>['rules'];
}

export const PromptInfoInput = (props: PromptInfoInputProps) => {
  const { initCount, disabled, rows } = props;
  const [count, setCount] = useState(initCount || 0);

  const handleChange = (v: string) => {
    setCount(v.length);
  };

  useEffect(() => {
    setCount(initCount || 0);
  }, [initCount]);

  const countSuffix = (
    <div className="overflow-hidden coz-fg-secondary text-sm pr-[9px]">{`${count}/${props.maxCount}`}</div>
  );

  if (disabled) {
    return <ReadonlyInput {...props} />;
  }

  if (rows && rows > 1) {
    return (
      <FormTextArea
        {...props}
        autosize
        autoComplete="off"
        onChange={(value: string) => handleChange(value)}
      />
    );
  }

  return (
    <FormInput
      {...props}
      autoComplete="off"
      suffix={countSuffix}
      onChange={value => handleChange(value)}
    />
  );
};

const ReadonlyInputCom = (props: PromptInfoInputProps) => {
  const { value } = props;
  return (
    <div className="w-full">
      <div className="coz-fg-secondary text-base break-all whitespace-pre-line">
        {value}
      </div>
    </div>
  );
};

const ReadonlyInput = withField(ReadonlyInputCom, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});
