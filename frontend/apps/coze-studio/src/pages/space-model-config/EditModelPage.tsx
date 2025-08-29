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

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Toast, Spin } from '@coze-arch/coze-design';

interface EditModelPageProps {
  [key: string]: never;
}

interface ModelDetail {
  id: string;
  name: string;
  description?: { [key: string]: string };
  icon_uri?: string;
  icon_url?: string;
  default_parameters?: Array<{
    name: string;
    label: { [key: string]: string };
    desc: { [key: string]: string };
    type: string;
    min?: string;
    max?: string;
    default_val: { [key: string]: string };
    precision?: number;
    options?: Array<{ label?: string; value?: string }>;
    style: {
      widget: string;
      label: { [key: string]: string };
    };
  }>;
  meta: {
    id: string;
    name: string;
    protocol: string;
    capability: {
      function_call?: boolean;
      input_modal?: string[];
      input_tokens?: number;
      json_mode?: boolean;
      max_tokens?: number;
      output_modal?: string[];
      output_tokens?: number;
      prefix_caching?: boolean;
      reasoning?: boolean;
      prefill_response?: boolean;
    };
    conn_config: {
      endpoint?: string;
      auth_type?: string;
      api_key?: string;
      headers?: { [key: string]: string };
      extra_params?: { [key: string]: string };
      // 兼容旧字段，可能后端返回的是这些字段
      base_url?: string;
      model?: string;
      temperature?: number;
      max_tokens?: number;
    };
    status: number;
  };
  created_at: number;
  updated_at: number;
}

const JSON_INDENT = 2;

function useEditModelLogic(modelId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modelDetail, setModelDetail] = useState<ModelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadModelDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/model/detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: modelId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setModelDetail(result.data);
        } else {
          setError(result.msg || '获取模型详情失败');
        }
      } else {
        setError('获取模型详情失败');
      }
    } catch (err) {
      console.error('Error loading model detail:', err);
      setError('获取模型详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (modelId) {
      loadModelDetail();
    }
  }, [modelId]);

  return {
    isLoading,
    isSaving,
    setIsSaving,
    modelDetail,
    error,
    loadModelDetail,
  };
}

interface EditModelFormProps {
  modelDetail: ModelDetail;
  isSaving: boolean;
  spaceId: string;
  onSubmit: (values: {
    name: string;
    description: string;
    defaultParameters: string;
    connConfig: string;
  }) => Promise<void>;
  navigate: (path: string) => void;
}

function EditModelForm({
  modelDetail,
  isSaving,
  spaceId,
  onSubmit,
  navigate,
}: EditModelFormProps) {
  const [defaultParametersJson, setDefaultParametersJson] = useState('');
  const [connConfigJson, setConnConfigJson] = useState('');

  useEffect(() => {
    if (modelDetail) {
      // 初始化JSON字段
      setDefaultParametersJson(
        JSON.stringify(modelDetail.default_parameters || [], null, JSON_INDENT)
      );
      setConnConfigJson(
        JSON.stringify(modelDetail.meta.conn_config || {}, null, JSON_INDENT)
      );
    }
  }, [modelDetail]);

  const formatJson = (jsonString: string, setter: (value: string) => void) => {
    try {
      const parsed = JSON.parse(jsonString);
      setter(JSON.stringify(parsed, null, JSON_INDENT));
      Toast.success('格式化成功');
    } catch (error) {
      Toast.error('JSON格式错误，请检查语法');
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    // 验证JSON格式
    try {
      JSON.parse(defaultParametersJson);
      JSON.parse(connConfigJson);
    } catch (error) {
      Toast.error('JSON格式错误，请检查语法');
      return;
    }

    await onSubmit({
      name: String(values.name || ''),
      description: String(values.description || ''),
      defaultParameters: defaultParametersJson,
      connConfig: connConfigJson,
    });
  };

  return (
    <Form
      layout="vertical"
      onSubmit={handleSubmit}
      autoComplete="off"
      initValues={{
        name: modelDetail.name,
        description: modelDetail.description?.zh || modelDetail.description?.en || '',
      }}
    >
      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">基本信息</h2>

        <div className="grid grid-cols-1 gap-4">
          <Form.Input
            label="模型名称"
            field="name"
            rules={[{ required: true, message: '请输入模型名称' }]}
            placeholder="请输入模型名称"
          />

          <Form.TextArea
            label="模型描述"
            field="description"
            placeholder="请输入模型描述"
            autosize={{ minRows: 2, maxRows: 4 }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">默认参数配置</h2>

        <Form.Slot label="默认参数（JSON格式）">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                模型的默认参数配置，如温度、最大tokens等
              </span>
              <Button
                size="small"
                onClick={() => formatJson(defaultParametersJson, setDefaultParametersJson)}
              >
                格式化
              </Button>
            </div>
            <textarea
              className="w-full h-[200px] p-3 border rounded-md font-mono text-xs leading-relaxed bg-gray-50"
              value={defaultParametersJson}
              onChange={e => setDefaultParametersJson(e.target.value)}
              placeholder="请输入JSON格式的默认参数配置"
              spellCheck={false}
            />
          </div>
        </Form.Slot>
      </div>

      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">连接配置</h2>

        <Form.Slot label="连接配置（JSON格式）">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                模型的连接配置信息，如API密钥、端点地址等
              </span>
              <Button
                size="small"
                onClick={() => formatJson(connConfigJson, setConnConfigJson)}
              >
                格式化
              </Button>
            </div>
            <textarea
              className="w-full h-[200px] p-3 border rounded-md font-mono text-xs leading-relaxed bg-gray-50"
              value={connConfigJson}
              onChange={e => setConnConfigJson(e.target.value)}
              placeholder="请输入JSON格式的连接配置"
              spellCheck={false}
            />
          </div>
        </Form.Slot>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={() => navigate(`/space/${spaceId}/models`)}
          disabled={isSaving}
        >
          取消
        </Button>
        <Button type="primary" htmlType="submit" loading={isSaving}>
          保存
        </Button>
      </div>
    </Form>
  );
}

export default function EditModelPage(_props: EditModelPageProps) {
  const navigate = useNavigate();
  const { space_id, model_id } = useParams<{ space_id: string; model_id: string }>();
  const spaceId = space_id || '0';
  const modelId = model_id || '';

  const {
    isLoading,
    isSaving,
    setIsSaving,
    modelDetail,
    error,
  } = useEditModelLogic(modelId);

  const handleSubmit = async (values: {
    name: string;
    description: string;
    defaultParameters: string;
    connConfig: string;
  }) => {
    setIsSaving(true);
    try {
      // 解析JSON数据
      const defaultParameters = JSON.parse(values.defaultParameters);
      const connConfig = JSON.parse(values.connConfig);

      // 构建更新请求 - 根据IDL定义，UpdateModelRequest支持这些字段
      const updateData: Record<string, unknown> = {
        model_id: modelId,
        name: values.name,
        description: {
          zh: values.description,
          en: values.description,
        },
        default_parameters: defaultParameters.map((param: any) => ({
          name: param.name,
          label: param.label || {},
          desc: param.desc || {},
          type: param.type,
          min: param.min,
          max: param.max,
          default_val: param.default_val || {},
          precision: param.precision,
          options: param.options || [],
          style: param.style || { widget: 'input', label: {} },
        })),
        conn_config: connConfig,
      };

      console.log('提交更新请求:', updateData);
      console.log('连接配置数据:', connConfig);

      // 调用更新API
      const response = await fetch('/api/model/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.code === 0) {
        Toast.success('模型更新成功');
        navigate(`/space/${spaceId}/models`);
      } else {
        const errorMsg = responseData.msg || responseData.message || '未知错误';
        Toast.error(`更新失败: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error updating model:', error);
      Toast.error('更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
            <h1 className="text-lg font-semibold">编辑模型</h1>
            <Button
              size="small"
              onClick={() => navigate(`/space/${spaceId}/models`)}
            >
              返回
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
            <h1 className="text-lg font-semibold">编辑模型</h1>
            <Button
              size="small"
              onClick={() => navigate(`/space/${spaceId}/models`)}
            >
              返回
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!modelDetail) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
            <h1 className="text-lg font-semibold">编辑模型</h1>
            <Button
              size="small"
              onClick={() => navigate(`/space/${spaceId}/models`)}
            >
              返回
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">模型不存在</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b">
        <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold">编辑模型</h1>
          <Button
            size="small"
            onClick={() => navigate(`/space/${spaceId}/models`)}
          >
            返回
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-4xl mx-auto px-6">
          <EditModelForm
            modelDetail={modelDetail}
            isSaving={isSaving}
            spaceId={spaceId}
            onSubmit={handleSubmit}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}