import { type ImportKnowledgeSourceSelectModuleProps } from '../module';
import { TableLocal } from '../../import-knowledge-source/table-local';
import { TableCustom } from '../../import-knowledge-source/table-custom';
import { SourceSelect } from '../../../components/source-select';

export const TableKnowledgeSourceSelect = (
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
      <TableLocal />
      <TableCustom />
    </SourceSelect>
  );
};
