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

import { useState, useCallback, useEffect } from 'react';

import { load } from 'js-yaml';
import { useBoolean } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozUpload,
  IconCozFilter,
  IconCozCheckMarkCircle,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import {
  Modal,
  Upload,
  Button,
  Input,
  Typography,
  Tag,
  Progress,
  Toast,
} from '@coze-arch/coze-design';

import {
  useImportAction,
  type ExtendedWorkflowResourceActionProps,
} from './use-import-action';

const { Text } = Typography;

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Helper functions
const validateFile = (file: File) => {
  const fileName = file.name.toLowerCase();
  const isValidFile =
    fileName.endsWith('.json') ||
    fileName.endsWith('.yml') ||
    fileName.endsWith('.yaml');

  if (!isValidFile) {
    Toast.error('Invalid file type');
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    Toast.error('File too large');
    return false;
  }

  return true;
};

const parseFileContent = async (
  file: File,
): Promise<Record<string, unknown> | null> => {
  const fileName = file.name.toLowerCase();
  const fileContent = await file.text();

  try {
    let workflowData: Record<string, unknown>;

    if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
      workflowData = load(fileContent) as Record<string, unknown>;
    } else {
      workflowData = JSON.parse(fileContent);
    }

    if (workflowData && typeof workflowData === 'object') {
      return workflowData;
    } else {
      Toast.error('Invalid workflow structure');
      return null;
    }
  } catch (error) {
    console.error('File parsing error:', error);
    Toast.error('Failed to parse file');
    return null;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

interface FileUploadAreaProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => Promise<boolean>;
}

const FileUploadArea = ({
  selectedFile,
  onFileSelect,
}: FileUploadAreaProps) => (
  <Upload
    accept=".json,.yml,.yaml"
    beforeUpload={async (object: { file: { fileInstance?: File } }) => {
      if (object.file.fileInstance) {
        await onFileSelect(object.file.fileInstance);
      }
      return { shouldUpload: false };
    }}
    showUploadList={false}
  >
    <div
      className={`
      w-full h-32 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
      ${
        selectedFile
          ? 'border-green-300 bg-green-50 hover:border-green-400'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      }
      flex flex-col items-center justify-center
    `}
    >
      {selectedFile ? (
        <div className="text-center">
          <IconCozCheckMarkCircle className="text-3xl text-green-500 mb-2" />
          <div className="text-base font-medium text-green-700 mb-1">
            File Selected
          </div>
          <div className="text-sm text-green-600 mb-1">{selectedFile.name}</div>
          <div className="flex items-center justify-center space-x-2 text-xs">
            <span className="text-green-500">
              {formatFileSize(selectedFile.size)}
            </span>
            <span className="text-gray-300">•</span>
            <Tag
              size="small"
              className="text-xs px-2 py-0"
              color={
                selectedFile.name.toLowerCase().endsWith('.json')
                  ? 'blue'
                  : 'purple'
              }
            >
              {selectedFile.name.toLowerCase().endsWith('.json')
                ? 'JSON'
                : 'YAML'}
            </Tag>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <IconCozUpload className="text-3xl text-gray-400 mb-2" />
          <div className="text-base font-medium text-gray-600 mb-1">
            Drag and drop or click to upload
          </div>
          <div className="text-sm text-gray-500">Supports JSON, YAML files</div>
        </div>
      )}
    </div>
  </Upload>
);

interface WorkflowPreviewProps {
  workflowPreview: Record<string, unknown>;
  selectedFile: File | null;
}

const WorkflowPreview = ({
  workflowPreview,
  selectedFile,
}: WorkflowPreviewProps) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span>Preview</span>
      {selectedFile ? (
        <Tag
          color={
            selectedFile.name.toLowerCase().endsWith('.json')
              ? 'blue'
              : 'purple'
          }
          className="ml-2"
        >
          {selectedFile.name.toLowerCase().endsWith('.json')
            ? 'JSON Format'
            : 'YAML Format'}
        </Tag>
      ) : null}
    </div>
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center p-3 bg-white rounded border">
          <div className="text-xl font-bold text-blue-600">
            {(workflowPreview.nodes as unknown[])?.length || 0}
          </div>
          <div className="text-xs text-blue-700">Nodes</div>
          <Tag color="blue" size="small" className="mt-1">
            节点
          </Tag>
        </div>

        <div className="text-center p-3 bg-white rounded border">
          <div className="text-xl font-bold text-green-600">
            {(workflowPreview.edges as unknown[])?.length || 0}
          </div>
          <div className="text-xs text-green-700">Edges</div>
          <Tag color="green" size="small" className="mt-1">
            连接
          </Tag>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <Text strong className="text-blue-700">
            Name:
          </Text>
          <div className="mt-1 p-2 bg-white rounded border text-sm">
            {String(workflowPreview.name || '')}
          </div>
        </div>

        {Boolean(workflowPreview.description) && (
          <div>
            <Text strong className="text-purple-700">
              Description:
            </Text>
            <div className="mt-1 p-2 bg-white rounded border text-sm">
              {String(workflowPreview.description)}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Custom hook for file handling
const useFileHandler = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowPreview, setWorkflowPreview] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      if (!validateFile(file)) {
        return false;
      }

      setSelectedFile(file);
      setParsing(true);

      const workflowData = await parseFileContent(file);

      if (workflowData) {
        setWorkflowPreview(workflowData);
      } else {
        return false;
      }

      return false; // 阻止自动上传
    } catch (error) {
      console.error('File selection error:', error);
      Toast.error('Invalid file');
      return false;
    } finally {
      setParsing(false);
    }
  }, []);

  const resetFileState = useCallback(() => {
    setSelectedFile(null);
    setWorkflowPreview(null);
    setParsing(false);
  }, []);

  return {
    selectedFile,
    workflowPreview,
    parsing,
    handleFileSelect,
    resetFileState,
  };
};

// Custom hook for form state
const useImportFormState = (
  workflowPreview: Record<string, unknown> | null,
) => {
  const [workflowName, setWorkflowName] = useState('');

  // Update workflow name when preview changes
  useEffect(() => {
    if (workflowPreview) {
      const importedWorkflowName =
        workflowPreview.name ||
        workflowPreview.workflow_id ||
        `Imported_${Date.now()}`;
      setWorkflowName(String(importedWorkflowName));
    }
  }, [workflowPreview]);

  const resetFormState = useCallback(() => {
    setWorkflowName('');
  }, []);

  return {
    workflowName,
    setWorkflowName,
    resetFormState,
  };
};

export const useImportWorkflowModal = (
  props: ExtendedWorkflowResourceActionProps,
) => {
  const [
    importModalVisible,
    { setTrue: openImportModal, setFalse: closeImportModal },
  ] = useBoolean(false);
  const { actionHandler: importAction, importing } = useImportAction(props);

  const {
    selectedFile,
    workflowPreview,
    parsing,
    handleFileSelect,
    resetFileState,
  } = useFileHandler();

  const { workflowName, setWorkflowName, resetFormState } =
    useImportFormState(workflowPreview);

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      Toast.error('Import failed');
      return;
    }

    try {
      if (!workflowName.trim()) {
        Toast.error('Workflow name is required');
        return;
      }
      await importAction(selectedFile);
      closeImportModal();
      resetFileState();
      resetFormState();
    } catch (error) {
      console.error('Import error:', error);
    }
  }, [
    selectedFile,
    workflowName,
    importAction,
    closeImportModal,
    resetFileState,
    resetFormState,
  ]);

  const handleCancel = useCallback(() => {
    closeImportModal();
    resetFileState();
    resetFormState();
  }, [closeImportModal, resetFileState, resetFormState]);

  const importModal = (
    <Modal
      title={
        <div className="flex items-center">
          <IconCozFilter className="mr-2 text-blue-600" />
          {I18n.t('workflow_import')}
        </div>
      }
      visible={importModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('Cancel')}
        </Button>,
        <Button
          key="import"
          type="primary"
          loading={importing}
          disabled={!selectedFile || parsing}
          onClick={handleImport}
          icon={importing ? undefined : <IconCozCheckMarkCircle />}
        >
          {I18n.t('import')}
        </Button>,
      ]}
      width={700}
      className="workflow-import-modal"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select File *
          </label>
          <FileUploadArea
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </div>

        {parsing ? (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <IconCozInfoCircle className="text-blue-500 mr-2" />
              <Text className="text-blue-600">Loading preview...</Text>
            </div>
            <Progress percent={100} showInfo={false} />
          </div>
        ) : null}

        {workflowPreview ? (
          <WorkflowPreview
            workflowPreview={workflowPreview}
            selectedFile={selectedFile}
          />
        ) : null}

        <div>
          <label className="block text-sm font-medium mb-2">
            Workflow Name *
          </label>
          <Input
            placeholder="Enter workflow name"
            value={workflowName}
            onChange={value => setWorkflowName(value)}
            className="text-base"
          />
        </div>
      </div>
    </Modal>
  );

  return {
    openImportModal,
    closeImportModal,
    importModal,
  };
};
