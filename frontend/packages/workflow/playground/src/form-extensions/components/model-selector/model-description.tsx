import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';
import { type ModelDescGroup } from '@coze-arch/bot-api/developer_api';

export const ModelDescription: React.FC<{
  descriptionGroupList: ModelDescGroup[];
}> = ({ descriptionGroupList }) => (
  <MdBoxLazy
    autoFixSyntax={{ autoFixEnding: false }}
    markDown={descriptionGroupList
      .map(({ group_name, desc }) => `${group_name}\n${desc?.join('\n')}`)
      .join('\n\n')}
  />
);
