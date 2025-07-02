import { MockSetDetail } from '@coze-agent-ide/bot-plugin/page';

const Plugin = ({
  pluginID,
  spaceID,
  toolID: propsToolID,
  mocksetID: propsMocksetID,
}: {
  pluginID: string;
  spaceID: string;
  toolID: string;
  mocksetID: string;
}) => (
  <MockSetDetail
    toolID={propsToolID}
    mocksetID={propsMocksetID}
    pluginID={pluginID}
    spaceID={spaceID}
  />
);

export default Plugin;
