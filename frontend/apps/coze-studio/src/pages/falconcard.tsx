import { useParams } from 'react-router-dom';
import { FalconCard } from '@coze-studio/workspace-adapter/card';

const Page = () => {
  const { space_id } = useParams();
  return space_id ? <FalconCard spaceId={space_id} /> : null;
};

export default Page;
