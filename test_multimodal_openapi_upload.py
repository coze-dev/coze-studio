#!/usr/bin/env python3
"""
多模态聊天测试脚本 - 使用OpenAPI标准上传接口 /v1/files/upload
"""

import requests
import json
from urllib.parse import urljoin

# 配置
BASE_URL = "https://agents.finmall.com"
API_KEY = "pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"
BOT_ID = "7551994989534773248"
IMAGE_PATH = "/Users/luzhipeng/Desktop/f23b20a2d24bc36ddcc490055e93edb2.jpg"

def _build_accessible_url(file_data):
    """将上传结果中的url/uri转换为可直接访问的绝对URL"""
    uri = (file_data.get('uri') or '').strip()
    raw_url = (file_data.get('url') or '').strip()

    # 服务端已经返回了带签名的完整访问URL（minio/s3），优先使用它
    if raw_url.startswith(('http://', 'https://')):
        return raw_url

    base = f"{BASE_URL.rstrip('/')}/"

    # 如果只有URI，则拼出/api/storage/<uri>路径（与文档保持一致）
    if uri:
        return urljoin(base, f"api/storage/{uri.lstrip('/')}")

    if raw_url:
        return urljoin(base, f"api/storage/{raw_url.lstrip('/')}")

    raise ValueError(f"无法从上传结果构造访问URL: {file_data}")


def upload_file_openapi(image_path):
    """使用OpenAPI标准接口上传文件"""
    print("步骤1: 上传文件 (使用/v1/files/upload)...")

    # 构造multipart/form-data请求
    with open(image_path, 'rb') as f:
        files = {
            'file': (f.name.split('/')[-1], f, 'image/png')
        }

        response = requests.post(
            f"{BASE_URL}/v1/files/upload",
            headers={
                "Authorization": f"Bearer {API_KEY}"
            },
            files=files
        )

    print(f"上传响应状态码: {response.status_code}")
    result = response.json()
    print(f"上传响应: {json.dumps(result, indent=2, ensure_ascii=False)}")

    if result.get('code') == 0 or response.status_code == 200:
        # 响应结构: {"data": {"id": "...", "url": "...", ...}}
        file_data = result.get('data', {})
        file_id = file_data.get('id', '')
        accessible_url = _build_accessible_url(file_data)

        print(f"✓ 文件上传成功")
        print(f"  文件ID: {file_id}")
        print(f"  文件URI: {file_data.get('uri', '')}")
        print(f"  文件URL: {accessible_url}")

        return accessible_url
    else:
        raise Exception(f"上传失败: {result}")

def create_conversation():
    """创建会话"""
    print("\n步骤2: 创建会话...")

    response = requests.post(
        f"{BASE_URL}/v1/conversation/create",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={"bot_id": BOT_ID}
    )

    result = response.json()
    conversation_id = result['data']['id']
    print(f"✓ 会话ID: {conversation_id}")
    return conversation_id

def send_multimodal_message(conversation_id, file_url):
    """发送多模态消息（文本+图片）"""
    print("\n步骤3: 发送图片分析请求（带文本提示）...")

    # 构造多模态content
    multimodal_content = json.dumps([
        {
            "type": "text",
            "text": "详细描述下图像中都有什么"
        },
        {
            "type": "file",
            "file_url": file_url
        }
    ], ensure_ascii=False)

    request_body = {
        "bot_id": BOT_ID,
        "conversation_id": conversation_id,
        "user_id": "test_user",
        "stream": False,
        "additional_messages": [
            {
                "role": "user",
                "content": multimodal_content,
                "content_type": "object_string"
            }
        ]
    }

    # 打印调试信息
    print("\n发送的请求内容:")
    print(json.dumps(request_body, indent=2, ensure_ascii=False))
    print()

    response = requests.post(
        f"{BASE_URL}/v3/chat",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=request_body,
        stream=True
    )

    # 处理流式响应
    print("\n收到响应:")
    print("-" * 80)
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data:'):
                data_json = line_str[5:].strip()
                if data_json:
                    try:
                        data = json.loads(data_json)
                        # 只打印回答内容
                        if data.get('type') == 'answer' and 'content' in data:
                            print(data['content'], end='', flush=True)
                    except:
                        pass
    print("\n" + "-" * 80)

def main():
    print("=" * 80)
    print("多模态聊天测试 (使用OpenAPI标准上传接口)")
    print("=" * 80)
    print()

    try:
        # 1. 上传文件
        file_url = upload_file_openapi(IMAGE_PATH)

        # 2. 验证URL是否可访问
        print("\n验证URL可访问性...", file_url)
        try:
            test_response = requests.head(file_url, timeout=10)
            print(f"URL访问测试状态码: {test_response.status_code}")
            if test_response.status_code == 200:
                print("✓ URL可以正常访问")
            else:
                print(f"⚠️ URL访问返回: {test_response.status_code}")
        except Exception as e:
            print(f"⚠️ URL访问测试失败: {e}")

        # 3. 创建会话
        conversation_id = create_conversation()

        # 4. 发送多模态消息
        send_multimodal_message(conversation_id, file_url)

        print("\n" + "=" * 80)
        print("测试完成")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
