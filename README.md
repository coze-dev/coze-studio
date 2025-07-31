![Image](https://p9-arcosite.byteimg.com/tos-cn-i-goo7wpa0wc/943f576df3424fa98580c2ad18946719~tplv-goo7wpa0wc-image.image)

<div align="center"><p>
<a href="#what-is-coze-studio">Coze Studio</a> •
<a href="#feature-list">Feature list</a> •
<a href="#quickstart">Quickstart</a> •
<a href="#developer-guide">Developer Guide</a>
</p>
<p>
  <img alt="License" src="https://img.shields.io/badge/license-apache2.0-blue.svg">
  <img alt="Go Version" src="https://img.shields.io/badge/go-%3E%3D%201.23.4-blue">
</p>

English | [中文](README.zh_CN.md)

</div>

## What is Coze Studio?

[Coze Studio](https://www.coze.cn/home) is an all-in-one AI agent development tool. Providing the latest large models and tools, various development modes and frameworks, Coze Studio offers the most convenient AI agent development environment, from development to deployment. 

* **Provides all core technologies needed for AI agent development**: prompt, RAG, plugin, workflow, enabling developers to focus on creating the core value of AI.
* **Ready to use for professional AI agent development at the lowest cost**: Coze Studio provides developers with complete app templates and build frameworks, allowing you to quickly construct various AI agents and turn creative ideas into reality.

Coze Studio, derived from the "Coze Development Platform" which has served tens of thousands of enterprises and millions of developers, we have made its core engine completely open. It is a one-stop visual development tool for AI Agents that makes creating, debugging, and deploying AI Agents unprecedentedly simple. Through Coze Studio's visual design and build tools, developers can quickly create and debug agents, apps, and workflows using no-code or low-code approaches, enabling powerful AI app development and more customized business logic. It's an ideal choice for building low-code AI products tailored . Coze Studio aims to lower the threshold for AI agent development and application, encouraging community co-construction and sharing for deeper exploration and practice in the AI field.

The backend of Coze Studio is developed using Golang, the frontend uses React + TypeScript, and the overall architecture is based on microservices and built following domain-driven design (DDD) principles. Provide developers with a high-performance, highly scalable, and easy-to-customize underlying framework to help them address complex business needs.
## Feature list
| **Module** | **Feature** |
| --- | --- |
| Model service | Manage the model list, integrate services such as OpenAI and Volcengine |
| Build agent | * Build, publish, and manage agent <br> * Support configuring workflows, knowledge bases, and other resources |
| Build apps | * Create and publish apps <br> * Build business logic through workflows |
| Build a workflow | Create, modify, publish, and delete workflows |
| Develop resources | Support creating and managing the following resources: <br> * Plugins <br> * Knowledge bases <br> * Databases <br> * Prompts |
| API and SDK | * Create conversations, initiate chats, and other OpenAPI <br> * Integrate agents or apps into your own app through Chat SDK |

## Quickstart
Learn how to obtain and deploy the open-source version of Coze Studio, quickly build projects, and experience Coze Studio's open-source version.
> Detailed steps and deployment requirements can be found in [Quickstart](https://github.com/coze-dev/coze-studio/wiki/2.-Quickstart).

Environment requirements:

* Before installing Coze Studio, please ensure that your machine meets the following minimum system requirements: 2 Core、4 GB
* Pre-install Docker and Docker Compose, and start the Docker service.

Deployment steps:

1. Retrieve the source code.
   ```Bash
   # Clone code
   git clone https://github.com/coze-dev/coze-studio.git
   ```

2. Configure the model.
   1. Copy the template files of the doubao-seed-1.6 model from the template directory and paste them into the configuration file directory.
      ```Bash
      cd coze-studio
      # Copy model configuration template
      cp backend/conf/model/template/model_template_ark_doubao-seed-1.6.yaml backend/conf/model/ark_doubao-seed-1.6.yaml
      ```

   2. Modify the template file in the configuration file directory.
      1. Enter the directory `backend/conf/model`. Open the file `ark_doubao-seed-1.6.yaml`.
      2. Set the fields `id`, `meta.conn_config.api_key`, `meta.conn_config.model`, and save the file.
         * **id**: The model ID in Coze Studio, defined by the developers themselves, must be a non-zero integer and globally unique. Do not modify the model ID after the model goes online.
         * **meta.conn_config.api_key**: The API Key for the model service, which in this example is the API Key for Volcengine Ark. Refer to [Retrieve Volcengine Ark API Key](https://www.volcengine.com/docs/82379/1541594) for the acquisition method.
         * **meta.conn_config.model**: The model ID of the model service, which in this example is the Endpoint ID of the Volcengine Ark doubao-seed-1.6 model access point. For retrieval methods, refer to [Retrieve Endpoint ID](https://www.volcengine.com/docs/82379/1099522).
3. Deploy and start the service.
   When deploying and starting Coze Studio for the first time, it may take a while to retrieve images and build local images. Please be patient. During deployment, you will see the following log information. If you see the message "Container coze-server Started," it means the Coze Studio service has started successfully.
   ```Bash
   # Start the service
   cd docker
   cp .env.example .env
   docker compose up -d
   ```
   For common startup failure issues, **please refer to the [FAQ](https://github.com/coze-dev/coze-studio/wiki/9.-FAQ)**.
4. After starting the service, you can open Coze Studio by accessing `http://localhost:8888/` through your browser.


## Developer Guide

* **Project Configuration**:
   * [Model Configuration](https://github.com/coze-dev/coze-studio/wiki/3.-Model-configuration): Before deploying the open-source version of Coze Studio, you must configure the model service. Otherwise, you cannot select models when building agents, workflows, and apps.
   * [Plugin Configuration](https://github.com/coze-dev/coze-studio/wiki/4.-Plugin-Configuration): To use official plugins from the plugin store, you must first configure the plugins and add the authentication keys for third-party services.
   * [Basic Component Configuration](https://github.com/coze-dev/coze-studio/wiki/5.-Basic-component-configuration): Learn how to configure components such as image uploaders to use functions like image uploading in Coze Studio .
* [API Reference](https://github.com/coze-dev/coze-studio/wiki/6.-API-Reference): The Coze Studio Community Edition API and Chat SDK are authenticated using Personal Access Token, providing APIs for conversations and workflows.
* [Development Guidelines](https://github.com/coze-dev/coze-studio/wiki/7.-Development-Standards):
   * [Project Architecture](https://github.com/coze-dev/coze-studio/wiki/7.-Development-Standards#project-architecture): Learn about the technical architecture and core components of the open-source version of Coze Studio.
   * [Code Development and Testing](https://github.com/coze-dev/coze-studio/wiki/7.-Development-Standards#code-development-and-testing): Learn how to perform secondary development and testing based on the open-source version of Coze Studio.
   * [Troubleshooting](https://github.com/coze-dev/coze-studio/wiki/7.-Development-Standards#troubleshooting): Learn how to view container states and system logs.

## Using the open-source version of Coze Studio
> Regarding how to use Coze Studio, refer to the [Coze Development Platform Official Documentation Center](https://www.coze.cn/open/docs) for more information. Please note that certain features, such as tone customization, are limited to the commercial version. Differences between the open-source and commercial versions can be found in the **Feature List**.


* [Quick Start](https://www.coze.cn/open/docs/guides/quickstart): Quickly build an AI assistant agent with Coze Studio.
* [Developing Agents](https://www.coze.cn/open/docs/guides/agent_overview): Learn how to create, build, publish, and manage agents. You can use functions such as knowledge, plugins, etc., to resolve model hallucination and lack of expertise in professional fields. In addition, Coze Studio provides rich memory features that enable agents to generate more accurate responses based on a personal user's historical conversations during interactions.
* [Develop workflows](https://www.coze.cn/open/docs/guides/workflow): A workflow is a set of executable instructions used to implement business logic or complete specific tasks. It structures data flow and task processing for apps or agents. Coze Studio provides a visual canvas where you can quickly build workflows by dragging and dropping nodes.
* [Resources such as plugins](https://www.coze.cn/open/docs/guides/plugin): In Coze Studio, workflows, plugins, databases, knowledge bases, and variables are collectively referred to as resources.
* **API & SDK**: Coze Studio supports [API related to chat and workflows](https://github.com/coze-dev/coze-studio/wiki/6.-API-Reference), and you can also integrate agents or apps with local business systems through [Chat SDK](https://www.coze.cn/open/docs/developer_guides/web_sdk_overview).
* [Tutorials for practice](https://www.coze.cn/open/docs/tutorial/chat_sdk_web_online_customer_service): Learn how to use Coze Studio to implement various AI scenarios, such as building web-based online customer service using Chat SDK.

## License
This project uses the Apache 2.0 license. For details, please refer to the [LICENSE](https://github.com/coze-dev/coze-studio/blob/main/LICENSE-APACHE) file.
## Community contributions
We welcome community contributions. For contribution guidelines, please refer to [CONTRIBUTING](https://github.com/coze-dev/coze-studio/blob/main/CONTRIBUTING.md) and [Code of conduct](https://github.com/coze-dev/coze-studio/blob/main/CODE_OF_CONDUCT.md). We look forward to your contributions!
## Security and privacy
If you discover potential security issues in the project, or believe you may have found a security issue, please notify the ByteDance security team through our [security center](https://security.bytedance.com/src) or [vulnerability reporting email](sec@bytedance.com).
Please **do not** create public GitHub Issues.
## Join Community

We are committed to building an open and friendly developer community. All developers interested in AI Agent development are welcome to join us!

### 🐛 Issue Reports & Feature Requests
To efficiently track and resolve issues while ensuring transparency and collaboration, we recommend participating through:
- **GitHub Issues**: [Submit bug reports or feature requests](https://github.com/coze-dev/coze-studio/issues)
- **Pull Requests**: [Contribute code or documentation improvements](https://github.com/coze-dev/coze-studio/pulls)

### 💬 Technical Discussion & Communication
Join our technical discussion groups to share experiences with other developers and stay updated with the latest project developments:

**Feishu Group Chat**  
Scan the QR code below with Feishu mobile app to join:

![Image](https://p9-arcosite.byteimg.com/tos-cn-i-goo7wpa0wc/0a49081e8f3743e8bf3dcdded4bb571a~tplv-goo7wpa0wc-image.image)

**Discord Server**  
Click to join: [Coze Community](https://discord.gg/sTVN9EVS4B)

**Telegram Group**  
Click to join: Telegram Group [Coze](https://t.me/+pP9CkPnomDA0Mjgx)

## Acknowledgments
Thank you to all the developers and community members who have contributed to the Coze Studio project. Special thanks:

* The [Eino](https://github.com/cloudwego/eino) framework team - providing powerful support for Coze Studio's agent and workflow runtime engines, model abstractions and implementations, and knowledge base indexing and retrieval
* The [FlowGram](https://github.com/bytedance/flowgram.ai) team - providing a high-quality workflow building engine for Coze Studio's frontend workflow canvas editor
* The [Hertz](https://github.com/cloudwego/hertz) team - Go HTTP framework with high-performance and strong-extensibility for building micro-services
* All users who participated in testing and feedback