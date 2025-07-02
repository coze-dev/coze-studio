import { MockSetList } from '@coze-agent-ide/bot-plugin/page';

const Plugin = ({
  toolID: propsToolID,
}: {
  pluginID: string;
  spaceID: string;
  toolID: string;
}) => <MockSetList toolID={propsToolID} />;

export default Plugin;
