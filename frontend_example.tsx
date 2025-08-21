/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { template_publish } from '@coze-studio/api-schema';

/**
 * 模板图标上传和发布示例组件
 */
const TemplatePublishExample: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedIconUri, setUploadedIconUri] = useState<string>('');
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // 文件转换为base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 data:image/png;base64, 前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // 获取文件扩展名
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  // 上传图标
  const handleUploadIcon = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 转换文件为base64
      const base64Data = await fileToBase64(selectedFile);
      const fileExtension = getFileExtension(selectedFile.name);

      // 调用上传接口
      const response = await template_publish.UploadTemplateIcon({
        file_head: {
          file_type: fileExtension,
          biz_type: template_publish.FileBizType.BIZ_TEMPLATE_ICON, // 11
        },
        data: base64Data,
      });

      if (response.code === 0) {
        // 上传成功，保存URI和URL
        setUploadedIconUri(response.data.upload_uri);
        setUploadedIconUrl(response.data.upload_url);
        console.log('图标上传成功:', response.data);
      } else {
        console.error('图标上传失败:', response.msg);
      }
    } catch (error: any) {
      // 处理特殊的成功响应错误处理
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          setUploadedIconUri(responseData.data.upload_uri);
          setUploadedIconUrl(responseData.data.upload_url);
          console.log('图标上传成功 (从错误中提取):', responseData.data);
        }
      } else {
        console.error('图标上传失败:', error);
      }
    } finally {
      setUploading(false);
    }
  };

  // 发布模板
  const handlePublishTemplate = async () => {
    if (!uploadedIconUri) {
      alert('请先上传图标');
      return;
    }

    setPublishing(true);
    try {
      const response = await template_publish.PublishAsTemplate({
        agent_id: '7532755646093983744', // 示例智能体ID
        title: '我的模板',
        description: '这是一个测试模板',
        is_public: true,
        cover_uri: uploadedIconUri, // 🎯 关键：使用上传后的URI
      });

      if (response.code === 0) {
        console.log('模板发布成功:', response);
        alert(`模板发布成功！模板ID: ${response.template_id}`);
      } else {
        console.error('模板发布失败:', response.msg);
      }
    } catch (error) {
      console.error('模板发布失败:', error);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">模板发布示例</h2>
      
      {/* 图标上传区域 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">1. 上传模板图标</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <button
          onClick={handleUploadIcon}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? '上传中...' : '上传图标'}
        </button>

        {/* 显示上传结果 */}
        {uploadedIconUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-semibold">✅ 图标上传成功！</p>
            <p className="text-sm text-gray-600 mt-1">URI: {uploadedIconUri}</p>
            <img 
              src={uploadedIconUrl} 
              alt="上传的图标" 
              className="mt-2 w-16 h-16 object-cover border rounded"
            />
          </div>
        )}
      </div>

      {/* 模板发布区域 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">2. 发布模板</h3>
        
        <button
          onClick={handlePublishTemplate}
          disabled={!uploadedIconUri || publishing}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {publishing ? '发布中...' : '发布模板'}
        </button>
      </div>

      {/* 说明文字 */}
      <div className="mt-6 p-3 bg-gray-50 border rounded text-sm text-gray-600">
        <p><strong>使用说明：</strong></p>
        <p>1. 选择图片文件并上传，获得 upload_uri</p>
        <p>2. 发布模板时使用 upload_uri 作为 cover_uri</p>
        <p>3. 模板列表显示时使用 upload_url 直接显示图片</p>
      </div>
    </div>
  );
};

export default TemplatePublishExample;

/**
 * 🎯 核心API调用示例
 */

// 1. 上传图标
export const uploadTemplateIcon = async (file: File) => {
  const base64Data = await fileToBase64(file);
  const fileExtension = getFileExtension(file.name);

  const response = await template_publish.UploadTemplateIcon({
    file_head: {
      file_type: fileExtension,
      biz_type: template_publish.FileBizType.BIZ_TEMPLATE_ICON,
    },
    data: base64Data,
  });

  return response.data; // { upload_url, upload_uri }
};

// 2. 发布模板（使用上传的URI）
export const publishTemplate = async (agentId: string, iconUri: string) => {
  const response = await template_publish.PublishAsTemplate({
    agent_id: agentId,
    title: '我的模板',
    description: '模板描述',
    is_public: true,
    cover_uri: iconUri, // 🎯 使用上传接口返回的URI
  });

  return response;
};

// 3. 显示模板列表（使用URL直接显示）
export const TemplateCard: React.FC<{ template: any }> = ({ template }) => {
  return (
    <div className="border rounded p-4">
      <img 
        src={template.cover_url} // 🎯 直接使用URL显示图片
        alt={template.title}
        className="w-16 h-16 object-cover rounded"
      />
      <h3>{template.title}</h3>
      <p>{template.description}</p>
    </div>
  );
};