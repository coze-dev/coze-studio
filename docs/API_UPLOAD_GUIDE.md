# 📤 Coze Studio 文件上传API文档

## 目录
- [认证方式](#认证方式)
- [上传方式对比](#上传方式对比)
- [方式一：Base64直接上传](#方式一base64直接上传)
- [方式二：获取临时上传凭证](#方式二获取临时上传凭证)
- [方式三：ImageX上传服务](#方式三imagex上传服务)
- [完整流程示例](#完整流程示例)
- [错误码说明](#错误码说明)
- [最佳实践](#最佳实践)

---

## 认证方式

所有上传接口支持两种认证方式：

### 1. Session Cookie (Web前端)
```http
Cookie: session_token=your_session_token
```

### 2. API Key (服务端/脚本)
```http
Authorization: Bearer pat_your_api_key_here
```

**获取API Key**:
1. 登录Coze Studio
2. 进入 设置 → API密钥
3. 创建新的API Key
4. 妥善保存生成的Key (格式: `pat_xxx`)

---

## 上传方式对比

| 上传方式 | 适用场景 | 文件大小限制 | 优点 | 缺点 |
|---------|---------|------------|-----|------|
| **Base64直传** | 小文件上传 | < 5MB | 简单,一次请求完成 | 大文件会超时 |
| **临时凭证上传** | 中大文件 | < 100MB | 直传对象存储,快速 | 需要两次请求 |
| **ImageX服务** | 图片优化 | < 50MB | 支持图片处理,CDN加速 | 仅适用于图片 |

---

## 方式一：Base64直接上传

### 接口信息

**接口路径**: `POST /api/bot/upload_file`

**支持认证**: ✅ Session Cookie | ✅ API Key

**适用场景**:
- 小文件上传 (< 5MB)
- 快速上传单个文件
- 脚本自动化上传

### 请求参数

```json
{
  "file_head": {
    "file_type": "string",  // 文件扩展名: jpg, png, pdf, doc等
    "biz_type": 1           // 业务类型，见下方枚举
  },
  "data": "string"          // Base64编码的文件内容
}
```

#### 业务类型枚举 (biz_type)

| 值 | 名称 | 说明 |
|----|------|------|
| 0 | BIZ_UNKNOWN | 未知类型 |
| 1 | BIZ_BOT_ICON | Bot图标 |
| 2 | BIZ_BOT_DATASET | Bot数据集 |
| 3 | BIZ_DATASET_ICON | 数据集图标 |
| 4 | BIZ_PLUGIN_ICON | 插件图标 |
| 5 | BIZ_BOT_SPACE | Bot空间 |
| 6 | BIZ_BOT_WORKFLOW | Bot工作流 |
| 7 | BIZ_SOCIETY_ICON | 社区图标 |
| 8 | BIZ_CONNECTOR_ICON | 连接器图标 |
| 9 | BIZ_LIBRARY_VOICE_ICON | 语音库图标 |
| 10 | BIZ_ENTERPRISE_ICON | 企业图标 |

### 响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "upload_url": "https://cdn.example.com/BIZ_BOT_ICON/xxx.jpg",
    "upload_uri": "BIZ_BOT_ICON/xxx.jpg"
  }
}
```

**字段说明**:
- `upload_url`: 文件的访问URL,可直接用于前端展示
- `upload_uri`: 文件的内部URI,用于后续API引用

### 完整示例

#### Bash + curl

```bash
#!/bin/bash

API_KEY="pat_your_api_key_here"
FILE_PATH="./bot_icon.png"

# 方法1: 使用base64命令 (推荐)
BASE64_DATA=$(base64 -i "$FILE_PATH" | tr -d '\n')

curl -X POST http://localhost:8888/api/bot/upload_file \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"file_head\": {
      \"file_type\": \"png\",
      \"biz_type\": 1
    },
    \"data\": \"$BASE64_DATA\"
  }"

# 响应示例:
# {
#   "code": 0,
#   "msg": "",
#   "data": {
#     "upload_url": "http://localhost:8889/opencoze/BIZ_BOT_ICON/7532755646093983744_1760498668296240000_WJWoTBgTdq.jpg?...",
#     "upload_uri": "BIZ_BOT_ICON/7532755646093983744_1760498668296240000_WJWoTBgTdq.jpg"
#   }
# }
```

#### Python

```python
import requests
import base64

def upload_file(file_path, api_key, biz_type=1):
    """
    上传文件到Coze Studio

    Args:
        file_path: 本地文件路径
        api_key: API密钥
        biz_type: 业务类型 (默认1=Bot图标)

    Returns:
        dict: 包含upload_url和upload_uri的响应
    """
    # 读取文件并编码为Base64
    with open(file_path, 'rb') as f:
        file_content = f.read()
        base64_content = base64.b64encode(file_content).decode('utf-8')

    # 获取文件扩展名
    file_extension = file_path.split('.')[-1]

    # 发送上传请求
    response = requests.post(
        'http://localhost:8888/api/bot/upload_file',
        json={
            'file_head': {
                'file_type': file_extension,
                'biz_type': biz_type
            },
            'data': base64_content
        },
        headers={
            'Authorization': f'Bearer {api_key}'
        }
    )

    # 解析响应
    result = response.json()
    if result['code'] == 0:
        return result['data']
    else:
        raise Exception(f"Upload failed: {result['msg']}")

# 使用示例
if __name__ == '__main__':
    api_key = 'pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33'
    result = upload_file('./bot_icon.png', api_key)

    print(f"上传成功!")
    print(f"访问URL: {result['upload_url']}")
    print(f"内部URI: {result['upload_uri']}")
```

#### Node.js

```javascript
const axios = require('axios');
const fs = require('fs');

/**
 * 上传文件到Coze Studio
 * @param {string} filePath - 本地文件路径
 * @param {string} apiKey - API密钥
 * @param {number} bizType - 业务类型 (默认1=Bot图标)
 * @returns {Promise<Object>} 包含upload_url和upload_uri的响应
 */
async function uploadFile(filePath, apiKey, bizType = 1) {
  // 读取文件并编码为Base64
  const fileContent = fs.readFileSync(filePath);
  const base64Content = fileContent.toString('base64');

  // 获取文件扩展名
  const fileExtension = filePath.split('.').pop();

  try {
    const response = await axios.post(
      'http://localhost:8888/api/bot/upload_file',
      {
        file_head: {
          file_type: fileExtension,
          biz_type: bizType
        },
        data: base64Content
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.code === 0) {
      return response.data.data;
    } else {
      throw new Error(`Upload failed: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('Upload error:', error.message);
    throw error;
  }
}

// 使用示例
(async () => {
  const apiKey = 'pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33';

  try {
    const result = await uploadFile('./bot_icon.png', apiKey);
    console.log('上传成功!');
    console.log('访问URL:', result.upload_url);
    console.log('内部URI:', result.upload_uri);
  } catch (error) {
    console.error('上传失败:', error.message);
  }
})();
```

#### Go

```go
package main

import (
    "bytes"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "path/filepath"
)

type UploadRequest struct {
    FileHead FileHead `json:"file_head"`
    Data     string   `json:"data"`
}

type FileHead struct {
    FileType string `json:"file_type"`
    BizType  int    `json:"biz_type"`
}

type UploadResponse struct {
    Code int         `json:"code"`
    Msg  string      `json:"msg"`
    Data UploadData  `json:"data"`
}

type UploadData struct {
    UploadURL string `json:"upload_url"`
    UploadURI string `json:"upload_uri"`
}

func uploadFile(filePath, apiKey string, bizType int) (*UploadData, error) {
    // 读取文件
    fileContent, err := ioutil.ReadFile(filePath)
    if err != nil {
        return nil, fmt.Errorf("read file error: %w", err)
    }

    // Base64编码
    base64Content := base64.StdEncoding.EncodeToString(fileContent)

    // 获取文件扩展名
    fileExtension := filepath.Ext(filePath)[1:]

    // 构造请求
    reqBody := UploadRequest{
        FileHead: FileHead{
            FileType: fileExtension,
            BizType:  bizType,
        },
        Data: base64Content,
    }

    reqJSON, _ := json.Marshal(reqBody)

    // 发送HTTP请求
    req, _ := http.NewRequest("POST", "http://localhost:8888/api/bot/upload_file", bytes.NewBuffer(reqJSON))
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("request error: %w", err)
    }
    defer resp.Body.Close()

    // 解析响应
    var uploadResp UploadResponse
    if err := json.NewDecoder(resp.Body).Decode(&uploadResp); err != nil {
        return nil, fmt.Errorf("decode response error: %w", err)
    }

    if uploadResp.Code != 0 {
        return nil, fmt.Errorf("upload failed: %s", uploadResp.Msg)
    }

    return &uploadResp.Data, nil
}

func main() {
    apiKey := "pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"

    result, err := uploadFile("./bot_icon.png", apiKey, 1)
    if err != nil {
        fmt.Println("Upload failed:", err)
        return
    }

    fmt.Println("上传成功!")
    fmt.Println("访问URL:", result.UploadURL)
    fmt.Println("内部URI:", result.UploadURI)
}
```

---

## 方式二：获取临时上传凭证

### 适用场景
- 大文件上传 (5MB - 100MB)
- 客户端直传对象存储
- 减轻服务器压力

### 流程说明

```
1. 客户端请求上传凭证
   ↓
2. 服务器返回临时Token和上传地址
   ↓
3. 客户端直接上传到对象存储
   ↓
4. 完成 (无需回调服务器)
```

### 步骤1: 获取上传凭证

**接口路径**: `POST /api/playground/upload/auth_token`

**请求参数**:
```json
{
  "scene": "bot_icon",      // 上传场景
  "data_type": "image"      // 数据类型
}
```

**场景枚举** (scene):
- `bot_icon` - Bot图标
- `bot_dataset` - Bot数据集
- `plugin_icon` - 插件图标
- `space` - 空间相关
- `workflow` - 工作流
- `enterprise` - 企业

**响应格式**:
```json
{
  "code": 0,
  "msg": "",
  "data": {
    "service_id": "your_service_id",
    "upload_path_prefix": "bot-icon-image",
    "auth": {
      "access_key_id": "AKIAXXXXXXXX",
      "secret_access_key": "xxxxxxxxxxxxx",
      "session_token": "temporary_token",
      "expired_time": "2025-10-15 12:24:51",
      "current_time": "2025-10-15 11:24:51"
    },
    "upload_host": "your-bucket.tos-cn-beijing.volces.com",
    "schema": "https"
  }
}
```

### 步骤2: 直接上传到对象存储

使用返回的凭证直接上传文件到对象存储:

**上传地址**: `{schema}://{upload_host}/{upload_path_prefix}/{filename}`

**请求头**:
```http
Authorization: Bearer {session_token}
Content-Type: image/jpeg
```

### 完整示例 (Node.js)

```javascript
const axios = require('axios');
const fs = require('fs');

async function uploadWithTempCredentials(filePath, apiKey) {
  // 步骤1: 获取临时凭证
  const tokenResponse = await axios.post(
    'http://localhost:8888/api/playground/upload/auth_token',
    {
      scene: 'bot_icon',
      data_type: 'image'
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );

  const { upload_host, upload_path_prefix, auth, schema } = tokenResponse.data.data;

  // 步骤2: 直接上传到对象存储
  const fileName = `icon_${Date.now()}.${filePath.split('.').pop()}`;
  const uploadUrl = `${schema}://${upload_host}/${upload_path_prefix}/${fileName}`;

  const fileContent = fs.readFileSync(filePath);

  await axios.put(
    uploadUrl,
    fileContent,
    {
      headers: {
        'Authorization': `Bearer ${auth.session_token}`,
        'Content-Type': 'image/png'
      }
    }
  );

  console.log('文件上传成功!');
  console.log('上传地址:', uploadUrl);

  return uploadUrl;
}

// 使用示例
(async () => {
  const apiKey = 'pat_your_api_key_here';
  await uploadWithTempCredentials('./bot_icon.png', apiKey);
})();
```

---

## 方式三：ImageX上传服务

### 适用场景
- 图片文件上传
- 需要图片处理和优化
- 需要CDN加速访问

### 步骤1: 申请上传地址

**接口路径**: `POST /api/common/upload/apply_upload_action`

**请求参数**:
```json
{
  "Action": "ApplyImageUpload",
  "Version": "2018-08-01",
  "ServiceId": "your_service_id",
  "FileExtension": "jpg",
  "FileSize": "1024000"
}
```

**响应格式**:
```json
{
  "ResponseMetadata": {
    "RequestId": "20250115xxxxx",
    "Action": "ApplyImageUpload",
    "Version": "2018-08-01",
    "Service": "imagex",
    "Region": "cn-north-1"
  },
  "Result": {
    "UploadAddress": {
      "StoreInfos": [{
        "StoreUri": "tos-cn-i-xxxxx/upload/xxx.jpg",
        "Auth": "upload_auth_token",
        "UploadID": "upload_session_id"
      }],
      "UploadHosts": ["imagex-upload.volccdn.com"],
      "SessionKey": "session_key_xxx"
    }
  }
}
```

### 步骤2: 直接上传文件

**接口路径**: `POST /api/common/upload/{tos_uri}`

**查询参数**:
- `uploadID`: 上传会话ID (分片上传时使用)
- `partNumber`: 分片编号 (分片上传时使用)

**请求头**:
```http
Authorization: Bearer pat_your_api_key_here
Content-Type: application/octet-stream
```

**请求体**: 二进制文件数据

### 完整示例 (Python)

```python
import requests

def upload_image_with_imagex(file_path, api_key):
    # 步骤1: 申请上传地址
    apply_response = requests.post(
        'http://localhost:8888/api/common/upload/apply_upload_action',
        json={
            'Action': 'ApplyImageUpload',
            'Version': '2018-08-01',
            'ServiceId': 'your_service_id',
            'FileExtension': 'jpg',
            'FileSize': str(os.path.getsize(file_path))
        },
        headers={
            'Authorization': f'Bearer {api_key}'
        }
    )

    result = apply_response.json()['Result']
    store_info = result['UploadAddress']['StoreInfos'][0]

    # 步骤2: 上传文件
    with open(file_path, 'rb') as f:
        file_content = f.read()

    upload_response = requests.post(
        f"http://localhost:8888/api/common/upload/{store_info['StoreUri']}",
        data=file_content,
        headers={
            'Authorization': f"Bearer {api_key}",
            'Content-Type': 'application/octet-stream'
        },
        params={
            'uploadID': store_info['UploadID']
        }
    )

    return upload_response.json()

# 使用示例
api_key = 'pat_your_api_key_here'
result = upload_image_with_imagex('./photo.jpg', api_key)
print('上传结果:', result)
```

---

## 完整流程示例

### 场景：批量上传Bot图标

```python
import os
import requests
import base64
from pathlib import Path

class CozeUploader:
    def __init__(self, api_key, base_url='http://localhost:8888'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def upload_file(self, file_path, biz_type=1):
        """上传单个文件"""
        # 读取并编码文件
        with open(file_path, 'rb') as f:
            file_content = base64.b64encode(f.read()).decode('utf-8')

        # 获取文件扩展名
        file_ext = Path(file_path).suffix[1:]

        # 发送请求
        response = requests.post(
            f'{self.base_url}/api/bot/upload_file',
            json={
                'file_head': {
                    'file_type': file_ext,
                    'biz_type': biz_type
                },
                'data': file_content
            },
            headers=self.headers
        )

        result = response.json()
        if result['code'] == 0:
            return result['data']
        else:
            raise Exception(f"Upload failed: {result['msg']}")

    def batch_upload(self, directory, pattern='*.png'):
        """批量上传目录下的文件"""
        results = []
        files = Path(directory).glob(pattern)

        for file_path in files:
            print(f'正在上传: {file_path.name}...')
            try:
                result = self.upload_file(str(file_path))
                results.append({
                    'file': file_path.name,
                    'success': True,
                    'url': result['upload_url'],
                    'uri': result['upload_uri']
                })
                print(f'  ✓ 成功: {result["upload_url"]}')
            except Exception as e:
                results.append({
                    'file': file_path.name,
                    'success': False,
                    'error': str(e)
                })
                print(f'  ✗ 失败: {e}')

        return results

# 使用示例
if __name__ == '__main__':
    # 初始化上传器
    uploader = CozeUploader('pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33')

    # 批量上传
    results = uploader.batch_upload('./icons', '*.png')

    # 打印统计
    success_count = sum(1 for r in results if r['success'])
    print(f'\n上传完成! 成功: {success_count}/{len(results)}')
```

---

## 错误码说明

### HTTP状态码

| 状态码 | 说明 | 常见原因 |
|--------|------|----------|
| 200 | 成功 | 请求正常处理 |
| 400 | 请求参数错误 | JSON格式错误、缺少必填字段 |
| 401 | 认证失败 | API Key无效或过期 |
| 403 | 权限不足 | API Key权限不足 |
| 413 | 文件过大 | 文件超过大小限制 |
| 500 | 服务器错误 | 服务器内部错误 |

### 业务错误码

| code | msg | 说明 | 解决方案 |
|------|-----|------|----------|
| 0 | success | 成功 | - |
| 40001 | authentication required | 缺少认证信息 | 添加Authorization请求头 |
| 40002 | invalid api key | API Key无效 | 检查API Key是否正确 |
| 40003 | api key expired | API Key过期 | 重新生成API Key |
| 40004 | permission denied | 权限不足 | 检查API Key权限设置 |
| 50001 | upload failed | 上传失败 | 检查文件格式和大小 |
| 50002 | file too large | 文件过大 | 使用临时凭证方式上传 |

### 错误处理示例

```python
try:
    result = upload_file('./icon.png', api_key)
    print('上传成功:', result['upload_url'])
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 401:
        print('认证失败,请检查API Key')
    elif e.response.status_code == 413:
        print('文件过大,请使用临时凭证方式上传')
    else:
        print(f'HTTP错误: {e.response.status_code}')
except Exception as e:
    print(f'上传失败: {e}')
```

---

## 最佳实践

### 1. 文件大小选择合适的上传方式

```python
def smart_upload(file_path, api_key):
    """根据文件大小智能选择上传方式"""
    file_size = os.path.getsize(file_path)

    if file_size < 5 * 1024 * 1024:  # < 5MB
        # 使用Base64直传
        return upload_with_base64(file_path, api_key)
    else:
        # 使用临时凭证上传
        return upload_with_temp_credentials(file_path, api_key)
```

### 2. 使用重试机制

```python
import time
from functools import wraps

def retry(max_attempts=3, delay=1):
    """上传失败自动重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f'上传失败,{delay}秒后重试... ({attempt + 1}/{max_attempts})')
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def upload_file_with_retry(file_path, api_key):
    return upload_file(file_path, api_key)
```

### 3. 使用环境变量存储API Key

```bash
# .env 文件
COZE_API_KEY=pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33
COZE_BASE_URL=http://localhost:8888
```

```python
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

api_key = os.getenv('COZE_API_KEY')
base_url = os.getenv('COZE_BASE_URL')

# 使用环境变量
uploader = CozeUploader(api_key, base_url)
```

### 4. 添加进度显示

```python
from tqdm import tqdm

def upload_with_progress(files, api_key):
    """带进度条的批量上传"""
    results = []

    with tqdm(total=len(files), desc='上传进度') as pbar:
        for file_path in files:
            try:
                result = upload_file(file_path, api_key)
                results.append({'success': True, 'data': result})
            except Exception as e:
                results.append({'success': False, 'error': str(e)})
            pbar.update(1)

    return results
```

### 5. 文件类型验证

```python
ALLOWED_EXTENSIONS = {
    'image': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'document': ['pdf', 'doc', 'docx', 'txt'],
    'archive': ['zip', 'tar', 'gz']
}

def validate_file(file_path, allowed_type='image'):
    """验证文件类型"""
    ext = Path(file_path).suffix[1:].lower()

    if ext not in ALLOWED_EXTENSIONS.get(allowed_type, []):
        raise ValueError(f'不支持的文件类型: {ext}')

    return True
```

### 6. API Key安全管理

```python
import keyring

# 安全存储API Key
def save_api_key(api_key):
    keyring.set_password('coze-studio', 'api_key', api_key)

# 安全读取API Key
def get_api_key():
    return keyring.get_password('coze-studio', 'api_key')

# 使用
api_key = get_api_key()
if not api_key:
    api_key = input('请输入API Key: ')
    save_api_key(api_key)
```

### 7. 日志记录

```python
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('upload.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def upload_with_logging(file_path, api_key):
    """带日志的上传"""
    logger.info(f'开始上传文件: {file_path}')

    try:
        result = upload_file(file_path, api_key)
        logger.info(f'上传成功: {result["upload_url"]}')
        return result
    except Exception as e:
        logger.error(f'上传失败: {e}')
        raise
```

---

## 性能优化建议

### 1. 并发上传

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def concurrent_upload(files, api_key, max_workers=5):
    """并发上传多个文件"""
    results = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有任务
        futures = {
            executor.submit(upload_file, file_path, api_key): file_path
            for file_path in files
        }

        # 收集结果
        for future in as_completed(futures):
            file_path = futures[future]
            try:
                result = future.result()
                results.append({
                    'file': file_path,
                    'success': True,
                    'data': result
                })
            except Exception as e:
                results.append({
                    'file': file_path,
                    'success': False,
                    'error': str(e)
                })

    return results
```

### 2. 文件压缩

```python
from PIL import Image
import io

def compress_image(file_path, max_size_mb=2):
    """压缩图片到指定大小"""
    img = Image.open(file_path)

    # 转换为RGB模式
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # 尝试不同的质量等级
    for quality in range(95, 20, -5):
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)

        if output.tell() < max_size_mb * 1024 * 1024:
            return output.getvalue()

    raise ValueError('无法将图片压缩到目标大小')
```

### 3. 缓存已上传的文件

```python
import hashlib
import json

class UploadCache:
    def __init__(self, cache_file='upload_cache.json'):
        self.cache_file = cache_file
        self.cache = self._load_cache()

    def _load_cache(self):
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except:
            return {}

    def _save_cache(self):
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f, indent=2)

    def get_file_hash(self, file_path):
        """计算文件哈希"""
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def get(self, file_path):
        """从缓存获取上传结果"""
        file_hash = self.get_file_hash(file_path)
        return self.cache.get(file_hash)

    def set(self, file_path, upload_result):
        """保存上传结果到缓存"""
        file_hash = self.get_file_hash(file_path)
        self.cache[file_hash] = upload_result
        self._save_cache()

# 使用缓存
cache = UploadCache()

def upload_with_cache(file_path, api_key):
    # 检查缓存
    cached = cache.get(file_path)
    if cached:
        print('使用缓存结果')
        return cached

    # 上传并缓存
    result = upload_file(file_path, api_key)
    cache.set(file_path, result)
    return result
```

---

## 常见问题 (FAQ)

### Q1: 上传文件大小限制是多少?

**A**:
- Base64直传: 建议 < 5MB
- 临时凭证上传: 建议 < 100MB
- ImageX服务: 建议 < 50MB

### Q2: 如何获取API Key?

**A**:
1. 登录Coze Studio
2. 进入 设置 → API密钥
3. 点击"创建新密钥"
4. 复制生成的Key (格式: `pat_xxx`)
5. 妥善保存,不要泄露

### Q3: API Key和Session Cookie有什么区别?

**A**:
- **Session Cookie**: 适用于Web前端,需要先登录
- **API Key**: 适用于服务端/脚本,直接使用Token
- **建议**: Web前端用Session,服务端/自动化用API Key

### Q4: 上传失败如何调试?

**A**:
1. 检查API Key是否正确
2. 检查文件格式是否支持
3. 检查文件大小是否超限
4. 查看完整的错误信息
5. 检查网络连接

### Q5: 支持哪些文件格式?

**A**:
- **图片**: jpg, jpeg, png, gif, webp
- **文档**: pdf, doc, docx, txt
- **压缩包**: zip, tar, gz
- 其他格式需要根据`biz_type`确认

### Q6: 上传的文件如何访问?

**A**:
使用返回的`upload_url`直接访问,例如:
```html
<img src="http://localhost:8889/opencoze/BIZ_BOT_ICON/xxx.jpg?..." />
```

### Q7: 可以删除已上传的文件吗?

**A**:
目前API不支持直接删除,需要联系管理员或通过后台管理界面操作。

### Q8: 如何批量上传文件?

**A**:
参考"完整流程示例"章节的批量上传代码。

---

## 附录

### A. 完整测试脚本

```bash
#!/bin/bash
# test_upload.sh - 完整的上传测试脚本

set -e

API_KEY="pat_your_api_key_here"
BASE_URL="http://localhost:8888"
TEST_FILE="test_icon.png"

echo "=========================================="
echo "  Coze Studio 文件上传测试"
echo "=========================================="
echo ""

# 测试1: Base64上传
echo "📤 测试1: Base64直接上传"
echo "文件: $TEST_FILE"
echo "大小: $(du -h "$TEST_FILE" | cut -f1)"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/bot/upload_file" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"file_head\": {
      \"file_type\": \"png\",
      \"biz_type\": 1
    },
    \"data\": \"$(base64 -i "$TEST_FILE" | tr -d '\n')\"
  }")

echo "响应: $RESPONSE"
CODE=$(echo $RESPONSE | jq -r '.code')

if [ "$CODE" = "0" ]; then
    UPLOAD_URL=$(echo $RESPONSE | jq -r '.data.upload_url')
    echo "✅ 上传成功!"
    echo "   URL: $UPLOAD_URL"
else
    echo "❌ 上传失败!"
    exit 1
fi

echo ""
echo "=========================================="

# 测试2: 获取上传凭证
echo "📤 测试2: 获取上传凭证"
echo ""

TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/playground/upload/auth_token" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "bot_icon",
    "data_type": "image"
  }')

echo "响应: $TOKEN_RESPONSE"
CODE=$(echo $TOKEN_RESPONSE | jq -r '.code')

if [ "$CODE" = "0" ]; then
    echo "✅ 获取凭证成功!"
    UPLOAD_HOST=$(echo $TOKEN_RESPONSE | jq -r '.data.upload_host')
    echo "   上传地址: $UPLOAD_HOST"
else
    echo "❌ 获取凭证失败!"
    exit 1
fi

echo ""
echo "=========================================="
echo "  所有测试通过! ✅"
echo "=========================================="
```

### B. API变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2025-01-15 | 初始版本,支持Session认证 |
| v1.1 | 2025-10-15 | 新增API Key认证支持 |
| v1.2 | TBD | 计划支持断点续传 |

### C. 联系方式

- **问题反馈**: GitHub Issues
- **技术支持**: support@coze.com
- **API文档**: https://docs.coze.com

---

**文档版本**: v1.1
**最后更新**: 2025-10-15
**维护者**: Coze Studio Team
