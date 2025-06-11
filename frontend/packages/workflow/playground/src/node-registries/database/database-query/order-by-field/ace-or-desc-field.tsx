import { ViewVariableType, useNodeTestId } from '@coze-workflow/base';
import { SingleSelect } from '@coze/coze-design';

import { withField, useField } from '@/form';

interface AceOrDescProps {
  type?: ViewVariableType;
}

const AceOrDescLabelMap = {
  [ViewVariableType.String]: ['A → Z', 'Z → A'],
  [ViewVariableType.Integer]: ['0 → 9', '9 → 0'],
  [ViewVariableType.Number]: ['0 → 9', '9 → 0'],
  [ViewVariableType.Boolean]: ['0 → 1', '1 → 0'],
  [ViewVariableType.Time]: ['0 → 9', '9 → 0'],
};

export const AceOrDescField = withField<AceOrDescProps>(({ type }) => {
  const { name, value, onChange, readonly } = useField<boolean>();

  const { getNodeSetterId } = useNodeTestId();

  const [aceLabel, descLabel] =
    type === undefined ? [] : AceOrDescLabelMap[type];

  return (
    <SingleSelect
      layout="hug"
      disabled={readonly}
      value={`${value}`}
      onChange={e => onChange(e.target.value === 'true')}
      options={[
        {
          label: aceLabel,
          value: 'true',
        },
        {
          label: descLabel,
          value: 'false',
        },
      ]}
      size="small"
      data-testid={getNodeSetterId(name)}
    />
  );
});
