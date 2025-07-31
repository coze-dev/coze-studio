/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
