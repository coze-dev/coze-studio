import { QueryFieldsSection } from './query-fields-section';
import { QueryFieldsList } from './query-fields-list';
import { QueryFieldsColumnTitles } from './query-fields-column-titles';

export function QueryFields() {
  return (
    <QueryFieldsSection>
      <QueryFieldsColumnTitles />
      <QueryFieldsList />
    </QueryFieldsSection>
  );
}
