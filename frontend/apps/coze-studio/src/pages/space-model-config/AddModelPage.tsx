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
import { Button, Select, Radio, Form, Toast } from '@coze-arch/coze-design';

interface AddModelPageProps {
  // Props interface - currently no props needed
  [key: string]: never;
}

interface ModelTemplate {
  id: string;
  name: string;
  provider: string;
  description: string;
  model_name?: string;
  model_type?: string;
}

// 模型类型映射关系
const MODEL_TYPE_MAPPING = {
  text_generation: 'llm',
  embedding: 'embedding',
  rerank: 'rerank',
};

// 本地模型厂商列表（需要用户自定义模型名称）
const LOCAL_PROVIDERS = ['本地模型'];

// 默认参数常量
const DEFAULT_MAX_TOKENS = 128000;
const DEFAULT_OUTPUT_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const JSON_INDENT = 2;

// 模型类型
const MODEL_TYPES = [
  { value: 'text_generation', label: '文本生成' },
  { value: 'embedding', label: '嵌入' },
  { value: 'rerank', label: 'Rerank' },
];

function useAddModelLogic(spaceId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModelType, setSelectedModelType] = useState<string>('');
  const [modelConfig, setModelConfig] = useState<string>('');
  const [formApi, setFormApi] = useState<{ setValue: (field: string, value: unknown) => void; getValues: () => Record<string, unknown> } | null>(null);
  const [templates, setTemplates] = useState<ModelTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [customModelName, setCustomModelName] = useState<string>('');

  // 判断是否为本地模型厂商
  const isLocalProvider = LOCAL_PROVIDERS.includes(
    selectedProvider.toLowerCase(),
  );

  // 从模板中提取唯一的厂商列表
  const providers = Array.from(new Set(templates.map(t => t.provider))).map(
    provider => ({
      value: provider,
      label: provider.toUpperCase(),
    }),
  );

  // 根据选择的厂商和模型类型过滤可用的模型
  const availableModels = React.useMemo(() => {
    if (!selectedProvider || !selectedModelType) {
      return [];
    }

    const filteredTemplates = templates.filter(t => {
      const providerMatch = t.provider === selectedProvider;
      const expectedType =
        MODEL_TYPE_MAPPING[
          selectedModelType as keyof typeof MODEL_TYPE_MAPPING
        ];
      const typeMatch = t.model_type === expectedType;
      return providerMatch && typeMatch;
    });

    const models = filteredTemplates.map(t => ({
      value: t.model_name || t.name,
      label: t.model_name || t.name,
      templateId: t.id,
    }));

    if (isLocalProvider && selectedModelType) {
      if (customModelName) {
        models.unshift({
          value: customModelName,
          label: `${customModelName} (自定义)`,
          templateId: 'custom',
        });
      } else {
        models.unshift({
          value: '',
          label: '请先输入模型名称',
          templateId: 'placeholder',
        });
      }
    }

    return models;
  }, [
    templates,
    selectedProvider,
    selectedModelType,
    isLocalProvider,
    customModelName,
  ]);

  // Load templates when component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await fetch('/api/model/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);
        } else {
          console.error('Failed to load templates');
          Toast.error('加载模型模板失败');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        Toast.error('加载模型模板失败');
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  return {
    isSaving,
    setIsSaving,
    selectedProvider,
    setSelectedProvider,
    selectedModelType,
    setSelectedModelType,
    modelConfig,
    setModelConfig,
    formApi,
    setFormApi,
    templates,
    setTemplates,
    isLoadingTemplates,
    setIsLoadingTemplates,
    customModelName,
    setCustomModelName,
    isLocalProvider,
    providers,
    availableModels,
  };
}

interface ModelConfigFormProps {
  isLocalProvider: boolean;
  isLoadingTemplates: boolean;
  providers: Array<{ value: string; label: string }>;
  selectedModelType: string;
  availableModels: Array<{ value: string; label: string; templateId: string }>;
  modelConfig: string;
  isSaving: boolean;
  spaceId: string;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onFormChange: (values: Record<string, unknown>) => void;
  onProviderChange: (
    value: string | number | unknown[] | Record<string, unknown>,
  ) => void;
  onModelTypeChange: (event: { target?: { value: string } } | string) => void;
  onBaseModelChange: (
    value: string | number | unknown[] | Record<string, unknown>,
  ) => Promise<void>;
  onFormApiReady: (api: unknown) => void;
  onModelConfigChange: (config: string) => void;
  navigate: (path: string) => void;
}

function ModelConfigForm({
  isLocalProvider,
  isLoadingTemplates,
  providers,
  selectedModelType,
  availableModels,
  modelConfig,
  isSaving,
  spaceId,
  onSubmit,
  onFormChange,
  onProviderChange,
  onModelTypeChange,
  onBaseModelChange,
  onFormApiReady,
  onModelConfigChange,
  navigate,
}: ModelConfigFormProps) {
  return (
    <Form
      layout="vertical"
      onSubmit={onSubmit}
      onValueChange={onFormChange}
      autoComplete="off"
      getFormApi={onFormApiReady}
    >
      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">基本信息</h2>

        <div className="grid grid-cols-2 gap-4">
          <Form.Input
            label="名称"
            field="name"
            rules={[{ required: true, message: '请输入模型名称' }]}
            placeholder={
              isLocalProvider
                ? '请输入模型名称（将用作基础模型）'
                : '请输入模型名称'
            }
          />

          <Form.Select
            label="厂商"
            field="provider"
            rules={[{ required: true, message: '请选择厂商' }]}
            placeholder={isLoadingTemplates ? '加载中...' : '请选择厂商'}
            onChange={onProviderChange}
            disabled={isLoadingTemplates}
          >
            {providers.map(provider => (
              <Select.Option key={provider.value} value={provider.value}>
                {provider.label}
              </Select.Option>
            ))}
          </Form.Select>
        </div>

        <Form.RadioGroup
          label="类型"
          field="modelType"
          rules={[{ required: true, message: '请选择模型类型' }]}
          onChange={onModelTypeChange}
        >
          {MODEL_TYPES.map(type => (
            <Radio key={type.value} value={type.value}>
              {type.label}
            </Radio>
          ))}
        </Form.RadioGroup>

        {selectedModelType === 'text_generation' && (
          <div className="mb-4">
            <Form.Checkbox field="functionCall">
              启用Function Call功能
            </Form.Checkbox>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Form.Select
            label="基础模型"
            field="baseModel"
            rules={[{ required: true, message: '请选择基础模型' }]}
            placeholder={
              availableModels.length === 0 ? '无匹配的模型' : '请选择基础模型'
            }
            disabled={availableModels.length === 0}
            onChange={onBaseModelChange}
          >
            {availableModels.map(model => (
              <Select.Option
                key={model.templateId}
                value={model.value}
                disabled={model.templateId === 'placeholder'}
              >
                {model.label}
              </Select.Option>
            ))}
          </Form.Select>

          <Form.Input
            label="最大token长度"
            field="maxTokens"
            placeholder="选填，例如：128000"
            type="number"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">详细配置</h2>

        <Form.Input
          label="链接"
          field="baseUrl"
          rules={[{ required: true, message: '请输入API链接' }]}
          placeholder="例如：https://api.openai.com/v1"
        />

        <Form.Input
          label="密钥"
          field="apiKey"
          rules={[{ required: true, message: '请输入API密钥' }]}
          placeholder="请输入API密钥"
          mode="password"
        />
      </div>

      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">模型信息</h2>

        <Form.Slot label="参数（JSON格式）">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                自动根据上述配置生成，可手动编辑
              </span>
              <Button
                size="small"
                onClick={() => {
                  try {
                    const configObj = JSON.parse(modelConfig);
                    onModelConfigChange(JSON.stringify(configObj, null, JSON_INDENT));
                    Toast.success('格式化成功');
                  } catch (error) {
                    console.error('JSON format error:', error);
                    Toast.error('JSON格式错误，请检查语法');
                  }
                }}
              >
                格式化
              </Button>
            </div>
            <textarea
              className="w-full h-[200px] p-3 border rounded-md font-mono text-xs leading-relaxed bg-gray-50"
              value={modelConfig}
              onChange={e => onModelConfigChange(e.target.value)}
              placeholder="请先填写上方的基本信息和详细配置"
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

export default function AddModelPage(_props: AddModelPageProps) {
  const navigate = useNavigate();
  const { space_id } = useParams<{ space_id: string }>();
  const spaceId = space_id || '0';

  const {
    isSaving,
    setIsSaving,
    setSelectedProvider,
    selectedModelType,
    setSelectedModelType,
    modelConfig,
    setModelConfig,
    formApi,
    setFormApi,
    templates,
    isLoadingTemplates,
    customModelName,
    setCustomModelName,
    isLocalProvider,
    providers,
    availableModels,
  } = useAddModelLogic(spaceId);

  // 当选择厂商时，更新选择的厂商
  const handleProviderChange = (
    value: string | number | unknown[] | Record<string, unknown>,
  ) => {
    const providerValue = String(value);
    setSelectedProvider(providerValue);
    if (formApi) {
      formApi.setValue('baseModel', undefined);
    }
  };

  // 当选择模型类型时，更新选择的类型
  const handleModelTypeChange = (
    event: { target?: { value: string } } | string,
  ) => {
    const value = typeof event === 'string' ? event : event.target?.value || '';
    setSelectedModelType(value);
    if (formApi) {
      formApi.setValue('baseModel', undefined);
    }
  };

  // 当选择基础模型时，获取对应的模板配置
  const handleBaseModelChange = async (
    value: string | number | unknown[] | Record<string, unknown>,
  ) => {
    const modelValue = String(value);

    // 如果是空值或者是提示选项，不处理
    if (!modelValue || modelValue === '') {
      return;
    }

    // 如果是本地模型的自定义选项，寻找对应的本地模型模板
    if (isLocalProvider && modelValue === customModelName) {
      // 查找本地模型的通用模板（根据模型类型）
      const expectedType = selectedModelType
        ? MODEL_TYPE_MAPPING[
            selectedModelType as keyof typeof MODEL_TYPE_MAPPING
          ]
        : null;
      const localTemplate = templates.find(
        t =>
          LOCAL_PROVIDERS.includes(t.provider) && t.model_type === expectedType,
      );

      if (localTemplate) {
        try {
          // 通过 API 获取本地模型模板内容
          const response = await fetch(
            `/api/model/template/content?template_id=${localTemplate.id}`,
          );
          if (response.ok) {
            const data = await response.json();
            const templateContent = data.content || '{}';

            // 解析模板内容
            const template = JSON.parse(templateContent);

            // 更新模板中的模型名称为用户输入的自定义名称
            const currentValues = formApi?.getValues() || {};
            const updatedTemplate = {
              ...template,
              name: currentValues.name || modelValue,
              meta: {
                ...template.meta,
                conn_config: {
                  ...template.meta.conn_config,
                  api_key: currentValues.apiKey || '',
                  model: modelValue, // 使用用户输入的自定义模型名称
                },
              },
            };
            setModelConfig(JSON.stringify(updatedTemplate, null, JSON_INDENT));

            // 自动填充base URL（如果模板中有）
            if (template.meta?.conn_config?.base_url && formApi) {
              formApi.setValue('baseUrl', template.meta.conn_config.base_url);
            }
          }
        } catch (error) {
          console.error('Error loading local model template:', error);
        }
      }
      return;
    }

    // 查找对应的模板
    const selectedTemplate = templates.find(
      t => (t.model_name || t.name) === modelValue,
    );
    if (selectedTemplate) {
      try {
        // 通过 API 获取模板内容
        const response = await fetch(
          `/api/model/template/content?template_id=${selectedTemplate.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          const templateContent = data.content || '{}';

          // 解析模板内容
          const template = JSON.parse(templateContent);

          // 自动填充base URL
          if (template.meta?.conn_config?.base_url && formApi) {
            formApi.setValue('baseUrl', template.meta.conn_config.base_url);
          }

          // 更新JSON配置
          const currentValues = formApi?.getValues() || {};
          const updatedTemplate = {
            ...template,
            name: currentValues.name || template.name,
            meta: {
              ...template.meta,
              conn_config: {
                ...template.meta.conn_config,
                api_key: currentValues.apiKey || '',
                model: modelValue,
              },
            },
          };
          setModelConfig(JSON.stringify(updatedTemplate, null, JSON_INDENT));
        }
      } catch (error) {
        console.error('Error loading template content:', error);
      }
    }
  };

  // 根据表单内容生成JSON配置
  const generateJsonConfig = (values: Record<string, unknown>) => {
    const config = {
      id: Date.now(),
      name: values.name,
      icon_uri: 'default_icon/model.png',
      description: {
        zh: `${values.name} 模型`,
        en: `${values.name} Model`,
      },
      default_parameters: [
        {
          name: 'temperature',
          label: { zh: '温度', en: 'Temperature' },
          desc: { zh: '控制输出的随机性', en: 'Controls randomness of output' },
          type: 'float',
          min: '0',
          max: '1',
          default_val: { default_val: '0.7' },
          style: {
            widget: 'slider',
            label: { zh: '生成随机性', en: 'Generation randomness' },
          },
        },
      ],
      meta: {
        protocol: values.provider,
        capability: {
          function_call:
            values.modelType === 'text_generation'
              ? values.functionCall || false
              : false,
          input_modal: ['text'],
          output_modal:
            values.modelType === 'embedding' ? ['embedding'] : ['text'],
          input_tokens: values.maxTokens || DEFAULT_MAX_TOKENS,
          output_tokens:
            values.modelType === 'text_generation' ? DEFAULT_OUTPUT_TOKENS : 0,
          max_tokens: values.maxTokens || DEFAULT_MAX_TOKENS,
        },
        conn_config: {
          base_url: values.baseUrl,
          api_key: values.apiKey,
          model: values.baseModel,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: DEFAULT_OUTPUT_TOKENS,
        },
      },
    };

    return JSON.stringify(config, null, JSON_INDENT);
  };

  // 当表单值变化时，更新JSON配置
  const handleFormChange = (values: Record<string, unknown>) => {
    // 更新自定义模型名称（用于本地模型）
    if (values.name !== undefined) {
      setCustomModelName(values.name || '');
    }

    if (
      values.name &&
      values.provider &&
      values.modelType &&
      values.baseModel &&
      values.baseUrl &&
      values.apiKey
    ) {
      // 如果已经有模板配置，则基于模板更新；否则生成新配置
      if (modelConfig) {
        try {
          const currentConfig = JSON.parse(modelConfig);
          const updatedConfig = {
            ...currentConfig,
            name: values.name,
            meta: {
              ...currentConfig.meta,
              capability: {
                ...currentConfig.meta?.capability,
                function_call:
                  values.modelType === 'text_generation'
                    ? values.functionCall || false
                    : false,
              },
              conn_config: {
                ...currentConfig.meta?.conn_config,
                base_url: values.baseUrl,
                api_key: values.apiKey,
                model: values.baseModel,
              },
            },
          };
          setModelConfig(JSON.stringify(updatedConfig, null, JSON_INDENT));
        } catch (error) {
          console.error('Error updating config:', error);
          const jsonConfig = generateJsonConfig(values);
          setModelConfig(jsonConfig);
        }
      } else {
        const jsonConfig = generateJsonConfig(values);
        setModelConfig(jsonConfig);
      }
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      // 生成最终的JSON配置
      const finalConfig = modelConfig || generateJsonConfig(values);

      // 验证JSON格式
      try {
        JSON.parse(finalConfig);
      } catch (error) {
        console.error('Invalid JSON format:', error);
        Toast.error('配置格式错误，请检查JSON格式');
        setIsSaving(false);
        return;
      }

      // 调用API保存模型
      const response = await fetch('/api/model/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          space_id: spaceId,
          json_content: finalConfig,
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.code === 0) {
        Toast.success('模型添加成功');
        // 返回模型配置页面
        navigate(`/space/${spaceId}/models`);
      } else {
        const errorMsg = responseData.msg || responseData.message || '未知错误';
        Toast.error(`保存失败: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error saving model:', error);
      Toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b">
        <div className="flex items-center justify-between px-6 py-3 max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold">添加模型</h1>
          <Button
            size="small"
            onClick={() => navigate(`/space/${spaceId}/models`)}
          >
            返回
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-2xl mx-auto px-6">
          <ModelConfigForm
            isLocalProvider={isLocalProvider}
            isLoadingTemplates={isLoadingTemplates}
            providers={providers}
            selectedModelType={selectedModelType}
            availableModels={availableModels}
            modelConfig={modelConfig}
            isSaving={isSaving}
            spaceId={spaceId}
            onSubmit={handleSubmit}
            onFormChange={handleFormChange}
            onProviderChange={handleProviderChange}
            onModelTypeChange={handleModelTypeChange}
            onBaseModelChange={handleBaseModelChange}
            onFormApiReady={setFormApi}
            onModelConfigChange={setModelConfig}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}

