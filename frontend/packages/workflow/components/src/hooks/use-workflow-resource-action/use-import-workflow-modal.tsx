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
import { useBoolean } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Modal, Upload, Button, Input, Form, message } from '@coze-arch/coze-design';
import { IconUpload } from '@coze-arch/coze-design/icons';

import { useImportAction } from './use-import-action';
import { type WorkflowResourceActionProps } from './type';

export const useImportWorkflowModal = (props: WorkflowResourceActionProps) => {
  const [importModalVisible, { setTrue: openImportModal, setFalse: closeImportModal }] = useBoolean(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowPreview, setWorkflowPreview] = useState<any>(null);
  const [form] = Form.useForm();

  const { actionHandler: importAction, importing } = useImportAction(props);

  const handleFileSelect = async (file: File) => {
    try {
      // 验证文件类型
      if (!file.name.endsWith('.json')) {
        message.error('请选择JSON格式的文件');
        return false;
      }

      // 验证文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        message.error('文件大小不能超过10MB');
        return false;
      }

      setSelectedFile(file);
      
      // 读取并预览文件内容
      const fileContent = await file.text();
      try {
        const workflowData = JSON.parse(fileContent);
        if (workflowData.name && workflowData.schema) {
          setWorkflowPreview(workflowData);
          setWorkflowName(workflowData.name);
          form.setFieldsValue({ workflowName: workflowData.name });
        } else {
          message.error('文件内容不是有效的工作流导出数据');
          return false;
        }
      } catch (error) {
        message.error('文件格式错误，请选择有效的JSON文件');
        return false;
      }

      return false; // 阻止自动上传
    } catch (error) {
      message.error('读取文件失败');
      return false;
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      message.error('请先选择要导入的文件');
      return;
    }

    try {
      await form.validateFields();
      await importAction(selectedFile);
      closeImportModal();
      resetForm();
    } catch (error) {
      // 错误已在useImportAction中处理
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setWorkflowName('');
    setWorkflowPreview(null);
    form.resetFields();
  };

  const handleCancel = () => {
    closeImportModal();
    resetForm();
  };

  const importModal = (
    <Modal
      title={I18n.t('import_workflow')}
      visible={importModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('cancel')}
        </Button>,
        <Button
          key="import"
          type="primary"
          loading={importing}
          disabled={!selectedFile}
          onClick={handleImport}
        >
          {I18n.t('import')}
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={I18n.t('select_file')}
          required
        >
          <Upload
            accept=".json"
            beforeUpload={handleFileSelect}
            showUploadList={false}
            maxCount={1}
          >
            <Button icon={<IconUpload />}>
              {selectedFile ? selectedFile.name : I18n.t('click_to_upload')}
            </Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            {I18n.t('support_json_format_max_10mb')}
          </div>
        </Form.Item>

        {workflowPreview && (
          <Form.Item
            label={I18n.t('workflow_preview')}
          >
            <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <div><strong>{I18n.t('name')}:</strong> {workflowPreview.name}</div>
              {workflowPreview.description && (
                <div><strong>{I18n.t('description')}:</strong> {workflowPreview.description}</div>
              )}
              <div><strong>{I18n.t('nodes')}:</strong> {workflowPreview.nodes?.length || 0}</div>
              <div><strong>{I18n.t('edges')}:</strong> {workflowPreview.edges?.length || 0}</div>
            </div>
          </Form.Item>
        )}

        <Form.Item
          label={I18n.t('workflow_name')}
          name="workflowName"
          rules={[
            { required: true, message: I18n.t('please_input_workflow_name') },
            { max: 50, message: I18n.t('workflow_name_max_50_chars') }
          ]}
        >
          <Input
            placeholder={I18n.t('please_input_workflow_name')}
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  return {
    openImportModal,
    closeImportModal,
    importModal,
  };
}; 