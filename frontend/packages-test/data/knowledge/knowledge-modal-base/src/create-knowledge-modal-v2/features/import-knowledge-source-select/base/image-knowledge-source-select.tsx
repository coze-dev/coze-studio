import { type ImportKnowledgeSourceSelectModuleProps } from '../module';
import { ImageLocal } from '../../import-knowledge-source/image-local';
import { SourceSelect } from '../../../components/source-select';

export const ImageKnowledgeSourceSelect = (
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
      <ImageLocal />
    </SourceSelect>
  );
};
