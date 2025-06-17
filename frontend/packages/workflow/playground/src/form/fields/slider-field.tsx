import { Slider } from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';

type SliderProps = Omit<
  React.ComponentProps<typeof Slider>,
  'value' | 'onChange'
>;

export const SliderField = withField<SliderProps>(props => {
  const { value, onChange } = useField<number | number[]>();

  return <Slider value={value} onChange={onChange} {...props} />;
});
