# Xquik 插件配置

Xquik 插件为智能体提供公开 X 数据的只读访问。它支持搜索帖子、获取单条帖子和获取用户资料。

Xquik 是独立的第三方服务，与 X Corp. 无隶属关系，也未获其认可。"Twitter" 和 "X" 是 X Corp. 的商标。

## 准备工作

- 已部署 Coze Studio 开源版
- 已从 [Xquik 控制台](https://dashboard.xquik.com) 获取 API 密钥

同一 Coze Studio 部署中的所有用户共享此密钥。请使用专用密钥，并监控其使用情况。

## 配置 API 密钥

1. 打开 `backend/conf/plugin/pluginproduct/plugin_meta.yaml`。
2. 找到 `plugin_id: 24` 条目。
3. 在认证载荷中设置 `service_token`：

   ```yaml
   payload: '{"key": "x-api-key", "service_token": "YOUR_XQUIK_API_KEY", "location": "Header"}'
   ```

4. 重启 `coze-server`，使其重新加载插件目录。
5. 打开 **探索 > 插件 > Xquik**。

切勿提交已配置的密钥。如果密钥出现在日志或版本控制中，请立即轮换。

## 可用工具

| 工具 | 用途 |
| --- | --- |
| `search_x_posts` | 按日期、作者、语言、媒体和互动量筛选公开 X 帖子。 |
| `get_x_post` | 获取单条公开帖子及其作者、媒体和互动数据。 |
| `get_x_user` | 获取公开用户资料及其受众和认证信息。 |

插件不提供写入操作、账号会话或私有数据。

## 测试插件

把 `search_x_posts` 添加到智能体或工作流，并要求它搜索某个主题的近期帖子。如果认证失败，请确认载荷键为 `x-api-key`，然后重启 `coze-server`。

搜索行为和分页方式请参阅 [Xquik REST API 文档](https://docs.xquik.com/api-reference/x/search-tweets)。
