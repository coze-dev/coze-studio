import { type ComponentProps } from 'react';

import { EnumImageModel } from '@coze-workflow/setters';

import { withField, useField } from '@/form';

type ImageModelSelectProps = Omit<
  ComponentProps<typeof EnumImageModel>,
  'value' | 'onChange'
>;

/**
 * 图像模型选择器
 */
export const ImageModelSelectField = withField<ImageModelSelectProps>(props => {
  const { value, readonly, onChange, errors } = useField<number>();

  return (
    <EnumImageModel
      value={value}
      readonly={readonly}
      onChange={newValue => onChange?.(newValue as number)}
      validateStatus={errors && errors.length > 0 ? 'error' : undefined}
      {...props}
    />
  );
});
