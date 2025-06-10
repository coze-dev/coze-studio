import { useEffect } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ValidationProvider } from './context';

type ValidationProps = Pick<
  SetterComponentProps,
  | 'children'
  | 'feedbackStatus'
  | 'feedbackText'
  | 'value'
  | 'onChange'
  | 'flowNodeEntity'
>;

export function withValidation<T extends ValidationProps>(
  component: React.ComponentType<T>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = component as any;

  return (props: SetterComponentProps) => {
    const { value, onChange, context } = props;

    useEffect(() => {
      // 初始化的时候触发一次校验 防止组件 onBlur 拿不到校验信息
      onChange && onChange(value);
    }, []);

    return (
      <ValidationProvider
        errors={[]}
        onTestRunValidate={callback => {
          const { dispose } = context.onFormValidate(callback);
          return dispose;
        }}
      >
        <Comp {...props} />
      </ValidationProvider>
    );
  };
}
