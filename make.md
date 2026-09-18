# make web / make debug / make fe / npm run dev

## 对比

| | `make web` | `make debug` | `make fe` | `npm run dev` |
|--|------------|--------------|-----------|---------------|
| **目的** | 快速体验整站 | 本地开发（偏全栈/后端） | 打前端静态包 | 前端热更新开发 |
| **前端** | 远程镜像里的构建产物 | 可选：用已有静态目录；没有才编一次 | 本地打包到 `bin/resources/static` | Rsbuild 本地 dev server |
| **后端** | 远程 `coze-studio-server` 镜像 | 本机 Go | 不涉及 | 不启动；API 代理到本机 Go |
| **前置依赖** | Docker | Docker 拉中间件镜像 | 无 | **必须先 `make debug`**（本机 Go + 中间件） |
| **中间件** | Docker 全套 | Docker 中间件 | 不涉及 | 由 `make debug` 提供 |
| **改本地业务代码** | 基本不生效 | Go 生效；前端静态要再 `make fe` 才更新 | 把当前前端编进静态目录 | 前端立刻热更新 |

## 各自在干什么

### `make web`

拉远程镜像（业务 + 中间件）在本地 Docker 跑，适合体验 / 接近生产。

- 使用 `docker/docker-compose.yml`
- 业务镜像：`cozedev/coze-studio-server`、`cozedev/coze-studio-web`
- 和本地开发代码基本无关，只挂少量配置（如 `docker/.env`、`backend/conf`、nginx）

### `make debug`

本机跑应用代码，中间件用 Docker。

- 等价于：`env` + `middleware` + `python` + `server`
- 使用 `docker/docker-compose-debug.yml` 起 MySQL / Redis / ES / MinIO 等
- Go 在本机进程跑；数据落在容器服务，并通常挂载到本机 `docker/data/...`
- 仅当 `./bin/resources/static` **不存在** 时才会调用 `make fe`，已有则不重编前端

### `make fe`

只构建前端静态资源，拷贝到：

- `bin/resources/static`（给本机 Go 托管）
- `backend/static`

不是热更新服务。给「后端顺便托管整站页面」用。

### `npm run dev`

在 `frontend/apps/coze-studio` 下执行，前端日常开发主路径。

**重要：必须先跑 `make debug`，再跑 `npm run dev`。**

`npm run dev` 只起前端热更新服务，不启后端和中间件；页面请求的 `/api`、`/v1` 会代理到 `http://localhost:8888`，因此依赖 `make debug` 已经拉起的本机 Go + Docker 中间件。顺序固定为：

```bash
make debug                                    # 先：本机 Go + Docker 中间件
cd frontend/apps/coze-studio && npm run dev   # 后：前端热更新
```

其他说明：

- 自带编译 + 热更新，**不依赖** `make fe`
- 不要单独只跑 `npm run dev`（没有后端时接口会失败）

## 怎么选

| 场景 | 用法 |
|------|------|
| 只想打开用一下 | `make web` |
| 主要改前端 | **先 `make debug`，再 `npm run dev`** |
| 主要改后端 / 不想单独起前端 | `make debug`，用后端托管静态页；前端有改动再 `make fe` |
| 已经在用 `npm run dev` | 不必反复 `make fe`；但后端挂了要重新 `make debug` |

## 一句话

- `make web`：体验远程现成包
- `make debug`：本地应用 + Docker 基础设施（前端 `npm run dev` 的前置）
- `make fe`：打静态资源给 Go 托管
- `npm run dev`：前端热更新；**务必先 `make debug`**
