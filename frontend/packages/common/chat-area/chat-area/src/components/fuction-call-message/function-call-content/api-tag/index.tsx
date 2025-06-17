import { Tag } from '@coze-arch/coze-design';

export interface APITagProps {
  type: 'Request' | 'Response';
}

export const APITag: React.FC<APITagProps> = ({ type }) => (
  <Tag className="mb-8px" color="primary" size="small">
    {type}
  </Tag>
);
