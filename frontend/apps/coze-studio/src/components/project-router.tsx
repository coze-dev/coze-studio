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

import { useParams } from 'react-router-dom';
import { ExploreProjectPage, ExternalAppPage } from '../routes/async-components';

export const ProjectRouter = () => {
  const { project_type } = useParams();

  // 添加调试信息
  console.log('ProjectRouter - project_type:', project_type);

  switch (project_type) {
    case 'tools':
      console.log('加载 ExternalAppPage');
      return <ExternalAppPage />;
    case 'latest':
      console.log('加载 ExploreProjectPage for latest');
      return <ExploreProjectPage />;
    default:
      console.log('加载 ExploreProjectPage for default, project_type:', project_type);
      return <ExploreProjectPage />;
  }
};