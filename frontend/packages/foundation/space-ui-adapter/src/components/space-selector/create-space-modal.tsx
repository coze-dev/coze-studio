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

interface CreateSpaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (space: any) => void;
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({ 
  visible, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('工作空间名称不能为空');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 调用真实的创建空间API
      const response = await fetch('/api/space/create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon_url: formData.icon_url.trim() || undefined,
          space_type: 1, // 1 = 个人空间
        })
      });
      
      const result = await response.json();

      if (result.code === 0) {
        onSuccess?.(result.data);
        onClose();
        setFormData({ name: '', description: '', icon_url: '' });
      } else {
        setError(result.msg || '创建失败');
      }
    } catch (err: any) {
      console.error('创建空间失败:', err);
      setError(err.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', icon_url: '' });
      setError('');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* 半透明遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[99998]" 
        onClick={handleClose}
      />
      
      {/* 弹框内容 */}
      <div className="fixed inset-0 flex items-center justify-center z-[99999] pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-[520px] pointer-events-auto flex flex-col max-h-[80vh]">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-[20px] font-medium">创建新工作空间</h2>
            <button 
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-[24px] leading-none disabled:opacity-50 w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
          
          {/* 描述文字 */}
          <div className="p-6 pb-4">
            <p className="text-gray-600 text-[14px] leading-relaxed">
              通过创建工作空间，将支持项目、智能体、插件、工作流和知识库在工作空间内进行协作和共享。
            </p>
          </div>
          
          {/* 头像图标设置区域 */}
          <div className="flex justify-center pb-6">
            <div className="relative">
              <div className="w-[72px] h-[72px] bg-gradient-to-br from-orange-400 to-orange-600 rounded-[16px] flex items-center justify-center text-white text-[28px] cursor-pointer hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  <circle cx="18" cy="8" r="3"/>
                  <path d="M18 11c-1.33 0-4 .67-4 2v1h8v-1c0-1.33-2.67-2-4-2z"/>
                </svg>
              </div>
              {/* 可以添加点击选择图标的功能 */}
            </div>
          </div>
          
          {/* 表单内容 - 可滚动 */}
          <div className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-[14px]">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  工作空间名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="请输入工作空间名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-[14px]"
                  disabled={loading}
                  maxLength={50}
                />
                <div className="text-right text-[12px] text-gray-400 mt-1">
                  {formData.name.length}/50
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="描述工作空间"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none text-[14px]"
                  rows={4}
                  disabled={loading}
                  maxLength={200}
                />
                <div className="text-right text-[12px] text-gray-400 mt-1">
                  {formData.description.length}/200
                </div>
              </div>
            </form>
          </div>
          
          {/* 底部按钮 - 固定位置 */}
          <div className="p-6 pt-4 border-t bg-white rounded-b-lg">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 text-[14px]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
              >
                {loading ? '创建中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};