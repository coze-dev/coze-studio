import { SelectAndSetFieldsSection } from './select-and-set-fields-section';
import { SelectAndSetFieldsList } from './select-and-set-fields-list';
import { SelectAndSetFieldsColumnsTitle } from './select-and-set-fields-columns-title';

export const SelectAndSetFields = () => (
  <SelectAndSetFieldsSection>
    <SelectAndSetFieldsColumnsTitle />
    <SelectAndSetFieldsList />
  </SelectAndSetFieldsSection>
);
