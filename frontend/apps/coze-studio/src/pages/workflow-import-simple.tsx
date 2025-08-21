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

import { useParams, useNavigate } from 'react-router-dom';

// 测试页面 - 逐步添加功能
const Page = () => {
  const { space_id } = useParams();
  const navigate = useNavigate();
  
  if (!space_id) {
    return <div>No space ID found</div>;
  }

  const handleGoBack = () => {
    navigate(`/space/${space_id}/library`);
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={handleGoBack}
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          ← 返回资源库
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500 }}>
          导入工作流
        </h1>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
        <h3>功能测试</h3>
        <p>空间ID: {space_id}</p>
        <p>✅ 基础页面显示正常</p>
        <p>✅ 返回按钮功能正常</p>
        <p>下一步：添加文件上传功能</p>
      </div>
    </div>
  );
};

export default Page;