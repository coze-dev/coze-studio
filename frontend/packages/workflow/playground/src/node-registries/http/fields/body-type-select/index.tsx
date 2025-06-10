import { type FieldProps, useField, withField } from '@/form';
import {
  Select,
  type SelectProps as BaseSelectProps,
} from '@coze/coze-design';
import { BodyType } from '../../setters/constants';
import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';

type SelectProps = Omit<
  BaseSelectProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'hasError'
>;

export const BodyTypeSelectField: React.FC<SelectProps & FieldProps> =
  withField<SelectProps>(props => {
    const { value, onChange, onBlur, errors } = useField<string | number>();

    const { fullscreenPanel, setFullscreenPanel } = useNodeFormPanelState();

    const handleOnChange = (v: string | number) => {
      if (fullscreenPanel && v !== BodyType.Json) {
        setFullscreenPanel(null);
      }
      onChange(v);
    };

    return (
      <Select
        {...props}
        value={value}
        onChange={v => handleOnChange(v as string | number)}
        onBlur={onBlur}
        hasError={errors && errors.length > 0}
      />
    );
  });
