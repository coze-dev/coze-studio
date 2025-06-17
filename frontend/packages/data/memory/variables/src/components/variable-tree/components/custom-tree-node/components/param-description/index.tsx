import { I18n } from '@coze-arch/i18n';
import { Input } from '@coze-arch/coze-design';

import { type Variable } from '@/store';

import { ReadonlyText } from '../readonly-text';

export const ParamDescription = (props: {
  data: Variable;
  onChange: (value: string) => void;
  readonly: boolean;
}) => {
  const { data, onChange, readonly } = props;
  return !readonly ? (
    <div className="flex flex-col w-full relative overflow-hidden">
      <Input
        value={data.description}
        placeholder={I18n.t('workflow_detail_llm_output_decription')}
        maxLength={200}
        onChange={value => {
          onChange(value);
        }}
        className="w-full"
      />
    </div>
  ) : (
    <ReadonlyText value={data.description ?? ''} />
  );
};
