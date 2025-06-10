import { useParams } from 'react-router-dom';

import { Develop } from '@coze-studio/workspace-adapter/develop';

const Page = () => {
  const { space_id } = useParams();
  return space_id ? <Develop spaceId={space_id} /> : null;
};

export default Page;
