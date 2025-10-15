#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
调试base64检测 - 检查后端是否正确识别base64格式
"""

import requests
import json
import base64

BASE_URL = "http://localhost:8888"
API_KEY = "pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"
BOT_ID = "7551994989534773248"

file_path = '/Users/luzhipeng/Desktop/f23b20a2d24bc36ddcc490055e93edb2.jpg'

# 创建一个超小的测试图片 (1x1 PNG)
base64_data = base64.b64encode(open(file_path, 'rb').read()).decode('utf-8')

# base64_data = base64_data[:50]

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_conversation():
    """创建会话"""
    response = requests.post(
        f"{BASE_URL}/v1/conversation/create",
        headers=HEADERS,
        json={"bot_id": BOT_ID}
    )
    result = response.json()
    return result['data']['id']

def test_tiny_base64():
    """测试超小base64图片"""
    print("测试: 超小PNG图片 (1x1像素)")
    print(f"Base64长度: {len(base64_data)} 字符")
    print(f"Base64开头: {base64_data[:50]}")

    conversation_id = create_conversation()
    print(f"会话ID: {conversation_id}")

    # 测试1: data URI格式
    print("\n--- 测试1: data URI格式 ---")
    data_uri = f"data:image/png;base64,{base64_data}"

    payload = {
        "bot_id": BOT_ID,
        "conversation_id": conversation_id,
        "user_id": "test_debug",
        "stream": False,
        "additional_messages": [{
            "role": "user",
            "content": json.dumps([
                {"type": "text", "text": "这是什么图片?"},
                {"type": "image", "file_url": data_uri}
            ]),
            "content_type": "object_string"
        }]
    }

    print(f"发送请求... (payload大小: {len(json.dumps(payload))} 字节)")
    response = requests.post(f"{BASE_URL}/v3/chat", headers=HEADERS, json=payload, stream=True)

    print(f"响应状态码: {response.status_code}")
    print(f"响应头: {dict(response.headers)}")

    print("\nSSE流内容:")
    line_count = 0
    for line in response.iter_lines():
        if line:
            line_count += 1
            print(f"[{line_count}] {line.decode('utf-8')}")

    if line_count == 0:
        print("⚠️ 未收到任何SSE数据!")

    # 测试2: 纯base64
    print("\n--- 测试2: 纯base64字符串 ---")

    payload2 = {
        "bot_id": BOT_ID,
        "conversation_id": conversation_id,
        "user_id": "test_debug",
        "stream": False,
        "additional_messages": [{
            "role": "user",
            "content": json.dumps([
                {"type": "text", "text": "再看看这个图"},
                {"type": "image", "file_url": base64_data}  # 纯base64
            ]),
            "content_type": "object_string"
        }]
    }

    print("发送请求...")
    response2 = requests.post(f"{BASE_URL}/v3/chat", headers=HEADERS, json=payload2, stream=True)

    print(f"响应状态码: {response2.status_code}")

    print("\nSSE流内容:")
    line_count2 = 0
    for line in response2.iter_lines():
        if line:
            line_count2 += 1
            print(f"[{line_count2}] {line.decode('utf-8')}")

    if line_count2 == 0:
        print("⚠️ 未收到任何SSE数据!")

if __name__ == "__main__":
    test_tiny_base64()
