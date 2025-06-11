import {
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
} from '@coze-workflow/base';

import { OutputsParamDisplay } from '@/form-extensions/components/output-param-display';
import { withField, useField } from '@/form';

export interface OutputsProps {
  id: string;
  name: string;
  settingOnErrorPath?: string;
  topLevelReadonly?: boolean;
  disabledTypes?: ViewVariableType[];
  title?: string;
  tooltip?: React.ReactNode;
  disabled?: boolean;
  customReadonly?: boolean;
  hiddenTypes?: ViewVariableType[];
  noCard?: boolean;
  jsonImport?: boolean;
  allowAppendRootData?: boolean;
  withDescription?: boolean;
  withRequired?: boolean;
}

export const OutputsDisplayField = withField<OutputsProps>(() => {
  const { value } = useField<
    {
      name: string;
      type: string;
      required?: boolean;
    }[]
  >();

  return (
    <OutputsParamDisplay
      options={{
        outputInfo: value?.map(item => ({
          ...item,
          label: item.name ?? '',
          type: VARIABLE_TYPE_ALIAS_MAP[item.type],
        })),
      }}
    />
  );
});
