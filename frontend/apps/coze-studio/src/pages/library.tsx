import { useParams } from 'react-router-dom';

import { LibraryPage } from '@coze-studio/workspace-adapter/library';

const Page = () => {
  const { space_id } = useParams();
  return space_id ? <LibraryPage spaceId={space_id} /> : null;
};

export default Page;
