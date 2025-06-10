import { useParams } from 'react-router-dom';

import { MocksetDetail } from '@coze-studio/workspace-base';

const Page = () => {
  const { plugin_id, space_id, tool_id, mock_set_id } = useParams();

  if (!plugin_id || !space_id || !tool_id || !mock_set_id) {
    throw Error('[plugin render error]: need plugin id and space id');
  }

  return (
    <MocksetDetail
      pluginID={plugin_id}
      toolID={tool_id}
      spaceID={space_id}
      mocksetID={mock_set_id}
    />
  );
};

export default Page;
