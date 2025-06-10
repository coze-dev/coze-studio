import { useRef } from 'react';

import { type FormApi } from '@coze-arch/bot-semi/Form';
import { Form } from '@coze-arch/bot-semi';

import { type DSLComponent, type TValue } from '../types';
import { findInputElementsWithDefault } from '../../../../utils/dsl-template';

type FormValue = Record<string, TValue>;
export const DSLForm: DSLComponent = ({
  context: { onChange, onSubmit, dsl },
  children,
}) => {
  const formRef = useRef<FormApi>();

  /**
   * text类型组件交互 支持 placeholder 表示默认值
   * @param formValues
   */
  const onSubmitWrap = (formValues: FormValue) => {
    if (!onSubmit) {
      return;
    }
    const inputElementsWithDefault = findInputElementsWithDefault(dsl);

    const newValues = Object.entries(formValues).reduce(
      (prev: Record<string, TValue>, curr) => {
        const [field, value] = curr;
        const input = inputElementsWithDefault.find(i => i.id === field);

        if (input && !value) {
          prev[field] = input.defaultValue;
        } else {
          prev[field] = value;
        }

        return prev;
      },
      {},
    );

    inputElementsWithDefault.forEach(input => {
      const { id, defaultValue } = input;

      if (id && !(id in newValues)) {
        newValues[id] = defaultValue;
      }
    });

    onSubmit(newValues);
  };

  return (
    <Form<FormValue>
      className="w-full"
      autoComplete="off"
      getFormApi={api => (formRef.current = api)}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onChange={formState => onChange?.(formState.values!)}
      onSubmit={onSubmitWrap}
    >
      {children}
    </Form>
  );
};
