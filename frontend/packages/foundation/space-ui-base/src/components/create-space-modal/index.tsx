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

import { useState } from 'react';

import { Modal, Input, Button, Toast, TextArea } from '@coze-arch/coze-design';

interface CreateSpaceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  onCreateSpace?: (data: {
    name: string;
    description: string;
  }) => Promise<void>;
}

export const CreateSpaceModal = ({
  visible,
  onCancel,
  onSuccess,
  onCreateSpace,
}: CreateSpaceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Toast.error('请输入工作空间名称');
      return;
    }

    if (!onCreateSpace) {
      Toast.error('创建功能不可用');
      return;
    }

    try {
      setLoading(true);

      // 调用外部提供的创建空间方法
      await onCreateSpace({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      Toast.success('工作空间创建成功');
      handleCancel();
      onSuccess?.();
    } catch (error) {
      console.error('创建工作空间失败:', error);
      Toast.error('创建工作空间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    onCancel();
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  return (
    <Modal
      title="创建新工作空间"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      maskClosable={false}
      style={{ zIndex: 9999 }}
    >
      <div className="py-4">
        {/* 描述文本 */}
        <div className="mb-8 text-[14px] text-gray-600 leading-relaxed">
          通过创建工作空间，将支持项目、智能体、插件、工作流和知识库在工作空间内进行协作和共享。
        </div>

        {/* 图标 */}
        <div className="flex justify-center mb-8">
          <div className="w-[80px] h-[80px] bg-orange-400 rounded-[16px] flex items-center justify-center">
            <div className="text-white text-[32px]">👥</div>
          </div>
        </div>

        {/* 表单 */}
        <div className="space-y-6">
          {/* 工作空间名称 */}
          <div>
            <label className="block text-[14px] font-medium text-gray-900 mb-2">
              工作空间名称 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                placeholder="请输入工作空间名称"
                value={formData.name}
                onChange={handleNameChange}
                maxLength={50}
                className="w-full"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[12px] text-gray-400">
                {formData.name.length}/50
              </div>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-[14px] font-medium text-gray-900 mb-2">
              描述
            </label>
            <div className="relative">
              <TextArea
                placeholder="描述工作空间"
                value={formData.description}
                onChange={handleDescriptionChange}
                maxLength={2000}
                rows={4}
                className="w-full"
              />
              <div className="absolute right-3 bottom-3 text-[12px] text-gray-400">
                {formData.description.length}/2000
              </div>
            </div>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button onClick={handleCancel} disabled={loading}>
            取消
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!formData.name.trim()}
          >
            确认
          </Button>
        </div>
      </div>
    </Modal>
  );
};
