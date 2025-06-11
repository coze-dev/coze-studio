import { type Variable } from '@coze-arch/bot-api/playground_api';

import { TagList } from '../tag-list';

interface VariablesProps {
  variables: Variable[];
}

export const Variables: React.FC<VariablesProps> = ({ variables }) => {
  const tagList = variables.map(({ key }) => key ?? '');

  return <TagList tags={tagList} max={5} />;
};
