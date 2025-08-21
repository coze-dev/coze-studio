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

// 最简单的测试页面
const Page = () => {
  const { space_id } = useParams();
  
  if (!space_id) {
    return <div>No space ID found</div>;
  }
  
  return (
    <div style={{ padding: '24px' }}>
      <h1>工作流导入页面 - 测试版本</h1>
      <p>空间ID: {space_id}</p>
      <p>这是一个最简单的测试页面，用于验证路由是否正常工作。</p>
      <p>如果你能看到这个页面，说明路由和权限验证都正常。</p>
      <p>如果还是显示"无法查看智能体"，说明问题在其他地方。</p>
    </div>
  );
};

export default Page;