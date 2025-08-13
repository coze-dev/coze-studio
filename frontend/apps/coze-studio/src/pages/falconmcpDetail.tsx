import { useParams } from 'react-router-dom';
import { FalconMcpDetail } from '@coze-studio/workspace-adapter/mcpDetail';

export const DetailPage = () => {
  const { space_id } = useParams();
  return space_id ? <FalconMcpDetail spaceId={space_id} /> : null;
};

export default DetailPage;
