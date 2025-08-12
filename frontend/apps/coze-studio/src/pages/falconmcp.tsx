import { useParams } from 'react-router-dom';
import { FalconMcp } from '@coze-studio/workspace-adapter/mcp';

const Page = () => {
  const { space_id } = useParams();
  return space_id ? <FalconMcp spaceId={space_id} /> : null;
};

export default Page;
