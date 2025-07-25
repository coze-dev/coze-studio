<div align="center">
<h1>Coze Studio 社区版</h1>
<p><strong> AI Agent 开发与运维的平台级解决方案</strong></p>
<p>
  <a href="#什么是Coze Studio">Coze Studio</a> •
  <a href="#功能清单">功能清单</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#开发指南">开发指南</a>
</p>
<p>
  <img alt="License" src="https://img.shields.io/badge/license-apache2.0-blue.svg">
  <img alt="Go Version" src="https://img.shields.io/badge/go-%3E%3D%201.23.4-blue">
</p>

[English](README.md) | 中文

</div>

## 什么是Coze Studio

[Coze Studio](https://www.coze.cn/home) 是一站式 AI Agent 开发工具。提供各类最新大模型和工具、多种开发模式和框架，从开发到部署，为你提供最便捷的 AI Agent 开发环境。上万家企业、数百万开发者正在使 Coze Studio。

* **提供 AI Agent 开发所需的全部核心技术**：Prompt、RAG、Plugin、Workflow、UI Builder ，使得开发者可以聚焦创造 AI 核心价值。
* **开箱即用，用最低的成本开发最专业的 AI Agent：​**Coze Studio 为开发者提供了健全的应用模板和编排框架，你可以基于它们快速构建各种 AI Agent ，将创意变为现实。Coze Studio 支持集成火山引擎各类资源，方便你的 AI Agent 实现快速扩容。

Coze Studio 是字节跳动新一代 AI Agent 开发平台**扣子（Coze）**的**开源版本**。通过 Coze Studio 提供的可视化设计与编排工具，开发者可以通过零代码或低代码的方式，快速打造和调试智能体、应用和工作流，实现强大的 AI 应用开发和更多定制化业务逻辑，是构建面向非编程用户的低代码 AI 产品的理想选择。Coze Studio 致力于降低 AI Agent 开发与应用门槛，鼓励社区共建和分享交流，助你在 AI 领域进行更深层次的探索与实践。

Coze Studio 的后端采用 Golang 开发，前端使用 React + TypeScript，整体基于微服务架构并遵循领域驱动设计（DDD）原则构建。为开发者提供一个高性能、高扩展性、易于二次开发的底层框架，助力开发者应对复杂的业务需求。
## 功能清单
<table>
        <thead>
            <tr>
                <th>功能模块</th>
                <th>功能点</th>
                <th>商业版</th>
                <th>社区版</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td rowspan="1">搭建智能体</td>
                <td>编排、发布、管理智能体</td>
                <td>✔️</td>
                <td>✔️</td>
            </tr>
            <tr>
                <td rowspan="1">搭建应用</td>
                <td>通过工作流搭建业务逻辑</td>
                <td>✔️</td>
                <td>✔️</td>
            </tr>
            <tr>
                <td rowspan="1">搭建工作流</td>
                <td>创建、修改、发布、管理工作流</td>
                <td>✔️</td>
                <td>✔️</td>
            </tr>
            <tr>
                <td rowspan="2">插件等开发资源</td>
                <td>插件、知识库、数据库、提示词</td>
                <td>✔️</td>
                <td>✔️</td>
            </tr>
            <tr>
                <td>音色、卡片、音视频通话等</td>
                <td>✔️</td>
                <td>-</td>
            </tr>
            <tr>
                <td rowspan="1">企业与团队空间</td>
                <td>企业团队管理、多人协作、SSO 等特性</td>
                <td>✔️</td>
                <td>-</td>
            </tr>
            <tr>
                <td rowspan="3">API 与 SDK</td>
                <td>OpenAPI</td>
                <td>✔️</td>
                <td>✔️</td>
            </tr>
            <tr>
                <td>Chat SDK</td>
                <td>✔️</td>
                <td>✔️</td>
            </tr>
            <tr>
                <td>Realtime 等 SDK、API</td>
                <td>✔️</td>
                <td>-</td>
            </tr>
        </tbody>
    </table>
## 快速开始
参考[快速开始](https://github.com/coze-dev/coze-studio/wiki/2.-快速开始)，了解如何获取并部署 Coze Studio 社区版，快速构建项目、体验 Coze Studio 社区版。
## 开发指南

* **项目配置**：
   * [模型配置](https://github.com/coze-dev/coze-studio/wiki/3.-模型配置)：部署 Coze Studio 社区版之前，必须配置模型服务，否则无法在搭建智能体、工作流和应用时选择模型。
   * [插件配置](https://github.com/coze-dev/coze-studio/wiki/4.-插件配置)：如需使用插件商店中的官方插件，必须先配置插件，添加第三方服务的鉴权秘钥。
   * [基础组件配置](https://github.com/coze-dev/coze-studio/wiki/5.-基础组件配置)：了解如何配置 ImageX 等服务，以便在 Coze Studio 中使用上传图片等功能。
* [API 参考](https://github.com/coze-dev/coze-studio/wiki/6.-API-参考)：和商业版不同，Coze Studio 社区版仅支持个人访问秘钥（PAT）鉴权，并支持对话和工作流相关 API。
* [开发规范](https://github.com/coze-dev/coze-studio/wiki/7.-开发规范)：
   * [项目架构](https://github.com/coze-dev/coze-studio/wiki/7.-%E5%BC%80%E5%8F%91%E8%A7%84%E8%8C%83#%E9%A1%B9%E7%9B%AE%E6%9E%B6%E6%9E%84)：了解 Coze Studio 社区版的技术架构与核心组件。
   * [代码开发与测试](https://github.com/coze-dev/coze-studio/wiki/7.-%E5%BC%80%E5%8F%91%E8%A7%84%E8%8C%83#%E4%BB%A3%E7%A0%81%E5%BC%80%E5%8F%91%E4%B8%8E%E6%B5%8B%E8%AF%95)：了解如何基于 Coze Studio 社区版进行二次开发与测试。
   * [故障排查](https://github.com/coze-dev/coze-studio/wiki/7.-%E5%BC%80%E5%8F%91%E8%A7%84%E8%8C%83#%E6%95%85%E9%9A%9C%E6%8E%92%E6%9F%A5)：了解如何查看容器状态、系统日志。

## 使用 Coze Studio 社区版
> 关于如何使用 Coze Studio，可参考[扣子开发平台官方文档中心](https://www.coze.cn/open/docs)获取更多资料。需要注意的是，音色等部分功能限商业版本使用，社区版与商业版的功能差异可参考**功能清单**。


* [快速入门](https://www.coze.cn/open/docs/guides/quickstart)：通过 Coze Studio 快速搭建一个 AI 助手智能体。
* [开发智能体](https://www.coze.cn/open/docs/guides/agent_overview)：如何创建、编排、发布与管理智能体。你可以使用知识、插件等功能解决模型幻觉、专业领域知识不足等问题。除此之外，Coze Studio 还提供了丰富的记忆功能，使智能体在与个人用户交互时，可根据个人用户的历史对话等生成更准确性的回复。
* [开发工作流](https://www.coze.cn/open/docs/guides/workflow)：工作流是一系列可执行指令的集合，用于实现业务逻辑或完成特定任务。它为应用/智能体的数据流动和任务处理提供了一个结构化框架。 Coze Studio 提供了一个可视化画布，你可以通过拖拽节点迅速搭建工作流。
* [插件等资源](https://www.coze.cn/open/docs/guides/plugin)：在 Coze Studio，工作流、插件、数据库、知识库和变量统称为资源。
* **API & SDK**： Coze Studio 支持[对话和工作流相关 API](https://github.com/coze-dev/coze-studio/wiki/6.-API-%E5%8F%82%E8%80%83)，你也可以通过 [Chat SDK](https://www.coze.cn/open/docs/developer_guides/web_sdk_overview) 将智能体或应用集成到本地业务系统。
* [实践教程](https://www.coze.cn/open/docs/tutorial/chat_sdk_web_online_customer_service)：了解如何通过 Coze Studio 实现各种 AI 场景，例如通过 Chat SDK 搭建网页在线客服。 

## License
本项目采用 Apache 2.0 许可证。详情请参阅 [LICENSE](https://github.com/coze-dev/coze-studio/blob/main/LICENSE-APACHE) 文件。
## 社区贡献
我们欢迎社区贡献，贡献指南参见 [CONTRIBUTING](https://github.com/coze-dev/coze-studio/blob/main/CONTRIBUTING.md) 和 [Code of conduct](https://github.com/coze-dev/coze-studio/blob/main/CODE_OF_CONDUCT.md)，期待您的贡献！
## 安全与隐私
如果你在该项目中发现潜在的安全问题，或你认为可能发现了安全问题，请通过我们的[安全中心](https://security.bytedance.com/src) 或[漏洞报告邮箱](https://code.byted.org/flowdevops/cozeloop/blob/feat/release/sec@bytedance.com)通知字节跳动安全团队。
请**不要**创建公开的 GitHub Issue。
## 加入社区
飞书移动端扫描以下二维码，加入 Coze Studio 技术交流群。

![Image](https://p9-arcosite.byteimg.com/tos-cn-i-goo7wpa0wc/194fe3b9832848f0b7540279c91700b3~tplv-goo7wpa0wc-image.image)
## 致谢
感谢所有为 Coze Studio 项目做出贡献的开发者和社区成员。特别感谢：

* Eino 框架团队提供的 LLM 集成支持
* Cloudwego 团队开发的高性能框架
* 所有参与测试和反馈的用户
