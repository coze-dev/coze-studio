import { type ImportKnowledgeSourceSelectModuleProps } from '../module';
import { TextLocal } from '../../import-knowledge-source/text-local';
import { TextCustom } from '../../import-knowledge-source/text-custom';
import { SourceSelect } from '../../../components/source-select';

export const TextKnowledgeSourceSelect = (
  props: Omit<ImportKnowledgeSourceSelectModuleProps, 'formatType'>,
) => {
  const { initValue, onChange } = props;
  return (
    <SourceSelect
      value={initValue}
      onChange={e => {
        onChange(e.target.value);
      }}
    >
      <TextLocal />
      <TextCustom />
    </SourceSelect>
  );
};
