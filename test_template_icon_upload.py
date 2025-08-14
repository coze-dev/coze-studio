#!/usr/bin/env python3
"""
测试模板图标上传接口的脚本
"""

import base64
import json
import requests

def test_template_icon_upload():
    """测试模板图标上传接口"""
    
    # 创建一个简单的1x1像素的PNG图片（base64编码）
    # 这是一个透明的1x1像素PNG图片的base64编码
    png_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAkG7d1gAAAABJRU5ErkJggg=="
    
    # 构造请求数据
    request_data = {
        "file_head": {
            "file_type": "png",
            "biz_type": 11  # BIZ_TEMPLATE_ICON
        },
        "data": png_data
    }
    
    # 发送请求
    url = "http://localhost:8888/api/template/upload_icon"
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=request_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("code") == 0:
                print("✅ 上传成功!")
                print(f"Upload URL: {data['data']['upload_url']}")
                print(f"Upload URI: {data['data']['upload_uri']}")
            else:
                print(f"❌ 上传失败: {data.get('msg', 'Unknown error')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 连接错误: 请确保后端服务正在运行在 localhost:8888")
    except Exception as e:
        print(f"❌ 请求错误: {str(e)}")

if __name__ == "__main__":
    test_template_icon_upload()