# 工作空间访问问题诊断指南

## 问题现象
前端显示：**"无法查看智能体，请检查你的网址或加入对应工作空间后重试"**

## 问题分析
这个错误通常由以下几个原因引起：

### 1. 后端服务未启动或无法访问
- 后端服务没有在 `http://localhost:8888` 上运行
- API代理配置有问题

### 2. 工作空间数据问题
- 数据库中没有工作空间数据
- 工作空间列表API返回空

### 3. 用户认证问题
- 用户未登录或登录状态失效
- 用户权限不足

## 诊断步骤

### 步骤1：检查后端服务状态
```bash
# 检查后端是否在运行
curl http://localhost:8888/health
# 或者
curl http://localhost:8888/api/health
```

**期望结果**: 返回200状态码和健康检查信息

### 步骤2：检查工作空间列表API
```bash
# 测试工作空间列表API
curl -X POST http://localhost:8888/api/playground_api/space/list \
  -H "Content-Type: application/json" \
  -d '{}'
```

**期望结果**: 返回工作空间列表，格式如下：
```json
{
  "code": 200,
  "data": {
    "space_info": {
      "bot_space_list": [
        {
          "id": "space_id",
          "name": "工作空间名称",
          ...
        }
      ]
    }
  }
}
```

### 步骤3：检查前端网络请求
1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 刷新页面
4. 查看是否有失败的API请求

**重点关注**:
- `/api/playground_api/space/list` 请求是否成功
- 是否有401、403、500等错误状态码

### 步骤4：检查浏览器控制台错误
1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 查看是否有JavaScript错误

## 解决方案

### 方案1：启动后端服务
```bash
cd coze_transformer/backend
go run main.go
```

确保看到类似输出：
```
Server started at :8888
```

### 方案2：检查数据库连接
确保后端配置文件中的数据库连接信息正确，并且数据库服务正在运行。

### 方案3：初始化工作空间数据
如果数据库中没有工作空间数据，需要创建默认工作空间：

```sql
-- 示例SQL（根据实际数据库结构调整）
INSERT INTO spaces (id, name, description, creator_id, create_time, update_time) 
VALUES (1, '默认工作空间', '系统默认工作空间', 1, NOW(), NOW());

INSERT INTO space_users (space_id, user_id, role, create_time) 
VALUES (1, 1, 'admin', NOW());
```

### 方案4：清除前端缓存
```bash
# 清除浏览器缓存并强制刷新
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# 或者清除localStorage
# 在浏览器控制台执行：
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 方案5：检查前端代理配置
确保前端开发服务器的代理配置正确：

```javascript
// 检查 vite.config.js 或类似配置文件
{
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    }
  }
}
```

## 临时解决方案

如果需要快速测试工作流导入功能，可以：

1. **直接访问工作流页面**:
   ```
   http://localhost:3000/work_flow?space_id=1&workflow_id=new
   ```

2. **使用API直接测试导入**:
   ```bash
   curl -X POST http://localhost:8888/api/workflow_api/import \
     -H "Content-Type: application/json" \
     -d '{
       "workflow_data": "...",
       "workflow_name": "测试工作流",
       "space_id": "1",
       "creator_id": "1",
       "import_format": "json"
     }'
   ```

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 后端服务启动日志
2. 浏览器控制台错误信息
3. Network标签中失败请求的详细信息
4. 数据库连接状态

这将帮助进一步诊断和解决问题。