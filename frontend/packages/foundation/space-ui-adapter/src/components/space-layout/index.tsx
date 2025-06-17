import { Outlet, useParams } from 'react-router-dom';

import { I18n } from '@coze-arch/i18n';
import { IconCozIllusAdd } from '@coze-arch/coze-design/illustrations';
import { Empty } from '@coze-arch/coze-design';

import { useInitSpace } from '../../hooks/use-init-space';

export const SpaceLayout = () => {
  const { space_id } = useParams();
  const { loading, spaceListLoading, spaceList } = useInitSpace(space_id);

  if (!loading && !spaceListLoading && spaceList.length === 0) {
    return (
      <Empty
        className="h-full justify-center w-full"
        image={<IconCozIllusAdd width="160" height="160" />}
        title={I18n.t('enterprise_workspace_no_space_title')}
        description={I18n.t('enterprise_workspace_default_tips1_nonspace')}
      />
    );
  }

  if (loading) {
    return null;
  }

  return <Outlet />;
};
