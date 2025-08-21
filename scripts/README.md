# 模型配置导入脚本

该脚本用于将 YAML 格式的模型配置文件导入到 Coze Studio 数据库中。

## 功能特性

- ✅ 支持单个配置文件导入
- ✅ 支持批量导入目录中的所有配置文件
- ✅ 使用 UUID 作为主键，确保唯一性
- ✅ 自动处理 JSON 字段转换
- ✅ 事务管理确保数据一致性
- ✅ 重复导入检查
- ✅ 详细的日志记录

## 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

## 配置数据库

1. 创建配置文件模板：
```bash
python model_importer.py --create-template
```

2. 编辑 `importer_config.yaml` 文件，配置数据库连接信息：
```yaml
database:
  host: localhost
  port: 3306
  database: coze
  username: root
  password: your_password
```

## 使用方法

### 导入单个配置文件
```bash
python model_importer.py --config ../backend/conf/model/openai.yaml
```

### 批量导入目录中的所有配置文件
```bash
python model_importer.py --batch ../backend/conf/model/
```

### 强制导入（覆盖已存在的模型）
```bash
python model_importer.py --config openai.yaml --force
```

### 指定数据库配置文件
```bash
python model_importer.py --config openai.yaml --db-config my_config.yaml
```

## 数据库表结构

脚本会将数据导入到以下两个表：

### model_meta 表
存储模型的元信息：
- `id`: UUID 主键
- `model_name`: 模型名称
- `protocol`: 协议类型
- `capability`: JSON 格式的能力配置
- `conn_config`: JSON 格式的连接配置

### model_entity 表
存储模型实体信息：
- `id`: UUID 主键
- `meta_id`: 关联 model_meta 表的 id
- `name`: 模型显示名称
- `default_params`: JSON 格式的默认参数

## YAML 配置文件格式

脚本支持以下 YAML 配置文件格式：

```yaml
id: 2001  # 可选，会被 UUID 覆盖
name: GPT-4o
description:
  zh: 中文描述
  en: English description
icon_uri: default_icon/openai_v2.png
icon_url: ""
default_parameters:
  - name: temperature
    type: float
    min: "0"
    max: "1"
    default_val:
      default_val: "1.0"
meta:
  name: GPT-4o
  protocol: openai
  capability:
    function_call: true
    input_modal:
      - text
      - image
  conn_config:
    base_url: "https://api.openai.com/v1"
    api_key: "your-api-key"
    model: "gpt-4o"
```

## 日志输出

脚本运行时会输出详细的日志信息：
- 数据库连接状态
- 文件加载情况
- 数据导入进度
- 错误信息和警告

## 错误处理

- 数据库连接失败时会终止程序
- 配置文件格式错误时会跳过该文件
- 模型已存在时会显示警告（除非使用 --force 参数）
- 导入失败时会自动回滚事务

## 注意事项

1. 确保数据库表结构与脚本兼容
2. 建议在导入前备份数据库
3. API 密钥等敏感信息会直接存储到数据库中，请注意安全性
4. UUID 主键确保了数据的唯一性，不会与现有数据冲突