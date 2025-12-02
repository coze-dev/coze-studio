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

/**
 * 深度合并对象工具函数
 * 只更新指定的字段，保留目标对象中的其他字段
 * @param target 目标对象（模板配置）
 * @param updates 需要更新的字段
 * @returns 合并后的新对象
 */
const deepMerge = (target: any, updates: any): any => {
  // 如果 updates 是 null/undefined，返回 target
  if (!updates || typeof updates !== 'object') {
    return target;
  }

  // 如果 target 不是对象，直接返回 updates
  if (!target || typeof target !== 'object') {
    return updates;
  }

  // 创建目标对象的浅拷贝
  const result = Array.isArray(target) ? [...target] : { ...target };

  // 遍历 updates 的所有键
  Object.keys(updates).forEach(key => {
    const updateValue = updates[key];
    const targetValue = target[key];

    // 如果更新值是对象且目标值也是对象，递归合并
    if (
      updateValue &&
      typeof updateValue === 'object' &&
      !Array.isArray(updateValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, updateValue);
    } else {
      // 否则直接覆盖（包括数组和基本类型）
      result[key] = updateValue;
    }
  });

  return result;
};

// 模型类型
const MODEL_TYPES = [
  { value: 'text_generation', label: '文本生成' },
  { value: 'embedding', label: '嵌入' },
  { value: 'rerank', label: 'Rerank' },
];

function useAddModelLogic(spaceId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModelType, setSelectedModelType] = useState<string>('text_generation');
  const [modelConfig, setModelConfig] = useState<string>('');
  const [formApi, setFormApi] = useState<{ setValue: (field: string, value: unknown) => void; getValues: () => Record<string, unknown> } | null>(null);
  const [templates, setTemplates] = useState<ModelTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [customModelName, setCustomModelName] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

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
    console.log('=== 可用模型计算调试 ===');
    console.log('选择的厂商:', selectedProvider);
    console.log('选择的模型类型:', selectedModelType);
    console.log('是否本地厂商:', isLocalProvider);
    console.log('自定义模型名称:', customModelName);
    console.log('模板总数:', templates.length);

    if (!selectedProvider || !selectedModelType) {
      console.log('未选择厂商或模型类型，返回空数组');
      return [];
    }

    const expectedType =
      MODEL_TYPE_MAPPING[
        selectedModelType as keyof typeof MODEL_TYPE_MAPPING
      ];
    console.log('期望的模型类型映射:', expectedType);

    const filteredTemplates = templates.filter(t => {
      const providerMatch = t.provider === selectedProvider;
      const typeMatch = t.model_type === expectedType;
      console.log(`模板 ${t.name}: 厂商匹配=${providerMatch}, 类型匹配=${typeMatch}, 厂商=${t.provider}, 类型=${t.model_type}`);
      return providerMatch && typeMatch;
    });

    console.log('过滤后的模板:', filteredTemplates);

    const models = filteredTemplates
      .filter(t => {
        const modelName = t.model_name || t.name;
        return modelName && modelName.trim(); // 过滤掉空名称或只有空格的模板
      })
      .map(t => ({
        value: t.model_name || t.name,
        label: t.model_name || t.name,
        templateId: t.id,
      }));

    if (isLocalProvider && selectedModelType) {
      console.log('本地厂商逻辑: customModelName=', customModelName);
      if (customModelName) {
        console.log('添加自定义模型到选项列表');
        models.unshift({
          value: customModelName,
          label: `${customModelName} (自定义)`,
          templateId: 'custom',
        });
      } else {
        console.log('添加占位符选项');
        models.unshift({
          value: '',
          label: '请先输入模型名称',
          templateId: 'placeholder',
        });
      }
    }

    console.log('最终可用模型:', models);
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

  // 当可用模型列表变化时，自动选中第一个模型并加载模板
  useEffect(() => {
    if (availableModels.length > 0 && formApi) {
      const currentBaseModel = formApi.getValues()?.baseModel;
      const firstModel = availableModels.find(m => m.templateId !== 'placeholder');
      // 只有当还没有选中模型时，才自动选中第一个
      if (firstModel && !currentBaseModel) {
        formApi.setValue('baseModel', firstModel.value);

        // 自动加载第一个模型的模板配置
        const loadFirstModelTemplate = async () => {
          const modelValue = String(firstModel.value);

          // 如果是本地模型的自定义选项
          if (isLocalProvider && modelValue === customModelName) {
            const expectedType = selectedModelType
              ? MODEL_TYPE_MAPPING[selectedModelType as keyof typeof MODEL_TYPE_MAPPING]
              : null;
            const localTemplate = templates.find(
              t => LOCAL_PROVIDERS.includes(t.provider) && t.model_type === expectedType,
            );

            if (localTemplate) {
              try {
                const response = await fetch(`/api/model/template/content?template_id=${localTemplate.id}`);
                if (response.ok) {
                  const data = await response.json();
                  const templateContent = data.content || '{}';
                  const template = JSON.parse(templateContent);
                  const currentValues = formApi?.getValues() || {};

                  const updates = {
                    name: currentValues.name || template.name,
                    meta: {
                      name: currentValues.modelName || modelValue,
                      conn_config: {
                        api_key: currentValues.apiKey || '',
                        model: currentValues.modelName || modelValue,
                      },
                    },
                  };

                  const updatedTemplate = deepMerge(template, updates);
                  setModelConfig(JSON.stringify(updatedTemplate, null, JSON_INDENT));

                  // 自动填充各个字段
                  if (template.meta?.conn_config?.base_url) {
                    formApi.setValue('baseUrl', template.meta.conn_config.base_url);
                  }
                  if (template.meta?.conn_config?.temperature !== undefined) {
                    formApi.setValue('temperature', template.meta.conn_config.temperature);
                  }
                  if (template.meta?.capability?.max_tokens !== undefined) {
                    formApi.setValue('maxTokens', template.meta.capability.max_tokens);
                  }
                  if (template.meta?.conn_config?.top_p !== undefined) {
                    formApi.setValue('topP', template.meta.conn_config.top_p);
                  }
                  if (template.meta?.conn_config?.top_k !== undefined) {
                    formApi.setValue('topK', template.meta.conn_config.top_k);
                  }
                  if (template.meta?.conn_config?.frequency_penalty !== undefined) {
                    formApi.setValue('frequencyPenalty', template.meta.conn_config.frequency_penalty);
                  }
                  if (template.meta?.conn_config?.presence_penalty !== undefined) {
                    formApi.setValue('presencePenalty', template.meta.conn_config.presence_penalty);
                  }
                  if (template.meta?.conn_config?.timeout) {
                    const timeoutSeconds = parseInt(String(template.meta.conn_config.timeout).replace(/[^\d]/g, ''));
                    formApi.setValue('timeout', timeoutSeconds);
                  }
                  if (template.meta?.conn_config?.stop && Array.isArray(template.meta.conn_config.stop)) {
                    formApi.setValue('stopSequences', template.meta.conn_config.stop.join(','));
                  }
                  // Response Format
                  if (template.meta?.conn_config?.deepseek?.response_format_type) {
                    formApi.setValue('responseFormat', template.meta.conn_config.deepseek.response_format_type);
                  } else if (template.meta?.conn_config?.ark?.response_format_type) {
                    formApi.setValue('responseFormat', template.meta.conn_config.ark.response_format_type);
                  }
                  // Seed
                  if (template.meta?.conn_config?.seed !== undefined) {
                    formApi.setValue('seed', template.meta.conn_config.seed);
                  }
                  // OpenAI specific
                  if (template.meta?.conn_config?.openai?.by_azure !== undefined) {
                    formApi.setValue('azureMode', template.meta.conn_config.openai.by_azure);
                  }
                  if (template.meta?.conn_config?.openai?.api_version) {
                    formApi.setValue('apiVersion', template.meta.conn_config.openai.api_version);
                  }
                  // ARK specific
                  if (template.meta?.conn_config?.ark?.region) {
                    formApi.setValue('arkRegion', template.meta.conn_config.ark.region);
                  }
                  if (template.meta?.conn_config?.ark?.access_key) {
                    formApi.setValue('arkAccessKey', template.meta.conn_config.ark.access_key);
                  }
                  if (template.meta?.conn_config?.ark?.secret_key) {
                    formApi.setValue('arkSecretKey', template.meta.conn_config.ark.secret_key);
                  }
                  if (template.meta?.conn_config?.ark?.retry_times !== undefined && template.meta?.conn_config?.ark?.retry_times !== null) {
                    formApi.setValue('arkRetryTimes', template.meta.conn_config.ark.retry_times);
                  }
                  // Claude specific
                  if (template.meta?.conn_config?.claude?.by_bedrock !== undefined) {
                    formApi.setValue('claudeBedrock', template.meta.conn_config.claude.by_bedrock);
                  }
                  if (template.meta?.conn_config?.claude?.access_key) {
                    formApi.setValue('claudeAccessKey', template.meta.conn_config.claude.access_key);
                  }
                  if (template.meta?.conn_config?.claude?.secret_access_key) {
                    formApi.setValue('claudeSecretKey', template.meta.conn_config.claude.secret_access_key);
                  }
                  if (template.meta?.conn_config?.claude?.session_token) {
                    formApi.setValue('claudeSessionToken', template.meta.conn_config.claude.session_token);
                  }
                  if (template.meta?.conn_config?.claude?.region) {
                    formApi.setValue('claudeRegion', template.meta.conn_config.claude.region);
                  }
                  if (template.meta?.conn_config?.claude?.budget_tokens !== undefined) {
                    formApi.setValue('claudeBudgetTokens', template.meta.conn_config.claude.budget_tokens);
                  }
                  // JSON Schema
                  if (template.meta?.conn_config?.qwen?.response_format?.jsonschema) {
                    formApi.setValue('qwenJsonSchema', JSON.stringify(template.meta.conn_config.qwen.response_format.jsonschema, null, 2));
                  }
                  if (template.meta?.conn_config?.openai?.response_format?.jsonschema) {
                    formApi.setValue('openaiJsonSchema', JSON.stringify(template.meta.conn_config.openai.response_format.jsonschema, null, 2));
                  }
                }
              } catch (error) {
                console.error('Error loading local model template:', error);
              }
            }
            return;
          }

          // 查找对应的模板
          const selectedTemplate = templates.find(t => (t.model_name || t.name) === modelValue);
          if (selectedTemplate) {
            try {
              const response = await fetch(`/api/model/template/content?template_id=${selectedTemplate.id}`);
              if (response.ok) {
                const data = await response.json();
                const templateContent = data.content || '{}';
                const template = JSON.parse(templateContent);

                // 自动填充各个字段
                if (template.meta?.conn_config?.base_url) {
                  formApi.setValue('baseUrl', template.meta.conn_config.base_url);
                }
                if (template.meta?.conn_config?.temperature !== undefined) {
                  formApi.setValue('temperature', template.meta.conn_config.temperature);
                }
                if (template.meta?.capability?.max_tokens !== undefined) {
                  formApi.setValue('maxTokens', template.meta.capability.max_tokens);
                }
                if (template.meta?.conn_config?.top_p !== undefined) {
                  formApi.setValue('topP', template.meta.conn_config.top_p);
                }
                if (template.meta?.conn_config?.top_k !== undefined) {
                  formApi.setValue('topK', template.meta.conn_config.top_k);
                }
                if (template.meta?.conn_config?.frequency_penalty !== undefined) {
                  formApi.setValue('frequencyPenalty', template.meta.conn_config.frequency_penalty);
                }
                if (template.meta?.conn_config?.presence_penalty !== undefined) {
                  formApi.setValue('presencePenalty', template.meta.conn_config.presence_penalty);
                }
                if (template.meta?.conn_config?.timeout) {
                  const timeoutSeconds = parseInt(String(template.meta.conn_config.timeout).replace(/[^\d]/g, ''));
                  formApi.setValue('timeout', timeoutSeconds);
                }
                if (template.meta?.conn_config?.stop && Array.isArray(template.meta.conn_config.stop)) {
                  formApi.setValue('stopSequences', template.meta.conn_config.stop.join(','));
                }
                // Response Format
                if (template.meta?.conn_config?.deepseek?.response_format_type) {
                  formApi.setValue('responseFormat', template.meta.conn_config.deepseek.response_format_type);
                } else if (template.meta?.conn_config?.ark?.response_format_type) {
                  formApi.setValue('responseFormat', template.meta.conn_config.ark.response_format_type);
                }
                // Seed
                if (template.meta?.conn_config?.seed !== undefined) {
                  formApi.setValue('seed', template.meta.conn_config.seed);
                }
                // OpenAI specific
                if (template.meta?.conn_config?.openai?.by_azure !== undefined) {
                  formApi.setValue('azureMode', template.meta.conn_config.openai.by_azure);
                }
                if (template.meta?.conn_config?.openai?.api_version) {
                  formApi.setValue('apiVersion', template.meta.conn_config.openai.api_version);
                }
                // ARK specific
                if (template.meta?.conn_config?.ark?.region) {
                  formApi.setValue('arkRegion', template.meta.conn_config.ark.region);
                }
                if (template.meta?.conn_config?.ark?.access_key) {
                  formApi.setValue('arkAccessKey', template.meta.conn_config.ark.access_key);
                }
                if (template.meta?.conn_config?.ark?.secret_key) {
                  formApi.setValue('arkSecretKey', template.meta.conn_config.ark.secret_key);
                }
                if (template.meta?.conn_config?.ark?.retry_times !== undefined && template.meta?.conn_config?.ark?.retry_times !== null) {
                  formApi.setValue('arkRetryTimes', template.meta.conn_config.ark.retry_times);
                }
                // Claude specific
                if (template.meta?.conn_config?.claude?.by_bedrock !== undefined) {
                  formApi.setValue('claudeBedrock', template.meta.conn_config.claude.by_bedrock);
                }
                if (template.meta?.conn_config?.claude?.access_key) {
                  formApi.setValue('claudeAccessKey', template.meta.conn_config.claude.access_key);
                }
                if (template.meta?.conn_config?.claude?.secret_access_key) {
                  formApi.setValue('claudeSecretKey', template.meta.conn_config.claude.secret_access_key);
                }
                if (template.meta?.conn_config?.claude?.session_token) {
                  formApi.setValue('claudeSessionToken', template.meta.conn_config.claude.session_token);
                }
                if (template.meta?.conn_config?.claude?.region) {
                  formApi.setValue('claudeRegion', template.meta.conn_config.claude.region);
                }
                if (template.meta?.conn_config?.claude?.budget_tokens !== undefined) {
                  formApi.setValue('claudeBudgetTokens', template.meta.conn_config.claude.budget_tokens);
                }
                // JSON Schema
                if (template.meta?.conn_config?.qwen?.response_format?.jsonschema) {
                  formApi.setValue('qwenJsonSchema', JSON.stringify(template.meta.conn_config.qwen.response_format.jsonschema, null, 2));
                }
                if (template.meta?.conn_config?.openai?.response_format?.jsonschema) {
                  formApi.setValue('openaiJsonSchema', JSON.stringify(template.meta.conn_config.openai.response_format.jsonschema, null, 2));
                }

                const currentValues = formApi?.getValues() || {};
                const updates = {
                  name: currentValues.name || template.name,
                  meta: {
                    name: currentValues.modelName || modelValue,
                    conn_config: {
                      api_key: currentValues.apiKey || '',
                      model: currentValues.modelName || modelValue,
                    },
                  },
                };

                const updatedTemplate = deepMerge(template, updates);
                setModelConfig(JSON.stringify(updatedTemplate, null, JSON_INDENT));
              }
            } catch (error) {
              console.error('Error loading template content:', error);
            }
          }
        };

        loadFirstModelTemplate();
      }
    }
  }, [availableModels, formApi, isLocalProvider, customModelName, selectedModelType, templates]);

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
    showAdvancedSettings,
    setShowAdvancedSettings,
    selectedProvider,
  };
}

interface ModelConfigFormProps {
  isLocalProvider: boolean;
  isLoadingTemplates: boolean;
  providers: Array<{ value: string; label: string }>;
  selectedModelType: string;
  selectedProvider: string;
  availableModels: Array<{ value: string; label: string; templateId: string }>;
  modelConfig: string;
  isSaving: boolean;
  spaceId: string;
  showAdvancedSettings: boolean;
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
  onToggleAdvancedSettings: () => void;
  navigate: (path: string) => void;
}

function ModelConfigForm({
  isLocalProvider,
  isLoadingTemplates,
  providers,
  selectedModelType,
  selectedProvider,
  availableModels,
  modelConfig,
  isSaving,
  spaceId,
  showAdvancedSettings,
  onSubmit,
  onFormChange,
  onProviderChange,
  onModelTypeChange,
  onBaseModelChange,
  onFormApiReady,
  onModelConfigChange,
  onToggleAdvancedSettings,
  navigate,
}: ModelConfigFormProps) {
  // 从 modelConfig 中解析 protocol
  let currentProtocol = '';
  try {
    if (modelConfig) {
      const parsedConfig = JSON.parse(modelConfig);
      currentProtocol = parsedConfig?.meta?.protocol || '';
    }
  } catch (error) {
    console.error('Failed to parse modelConfig:', error);
  }
  // 如果 modelConfig 中没有 protocol,使用 selectedProvider 作为回退
  if (!currentProtocol && selectedProvider) {
    currentProtocol = selectedProvider.toLowerCase();
  }

  console.log("=== Protocol Debug ===");
  console.log("modelConfig:", modelConfig ? "exists" : "empty");
  console.log("selectedProvider:", selectedProvider);
  console.log("currentProtocol:", currentProtocol);
  console.log("===================");
  return (
    <>
      <style>{`
        /* 输入框样式优化 - 白色背景、选中后灰色、更大尺寸 */
        .semi-input,
        .semi-input-wrapper input,
        .semi-input-default {
          background-color: white !important;
          height: 42px !important;
          font-size: 14px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 6px !important;
          transition: all 0.2s ease;
        }

        .semi-input:hover,
        .semi-input-wrapper:hover input {
          background-color: #f3f4f6 !important;
          border-color: #9ca3af !important;
        }

        .semi-input:focus,
        .semi-input-wrapper input:focus,
        .semi-input-focus,
        .semi-input-wrapper-focus input {
          background-color: #f3f4f6 !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Select 下拉框样式优化 - 厂商和基础模型 */
        /* 外部容器 */
        .semi-select {
          height: 42px !important;
          min-height: 42px !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
          position: relative !important;
        }

        /* 内部选择框 */
        .semi-select-selection,
        .semi-select .semi-select-selection {
          background-color: white !important;
          height: 42px !important;
          min-height: 42px !important;
          line-height: 38px !important;
          font-size: 14px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 6px !important;
          transition: all 0.2s ease;
          padding: 0 12px !important;
          padding-right: 36px !important;
          display: flex !important;
          align-items: center !important;
        }

        /* 选择框内的文本 */
        .semi-select-selection-text {
          line-height: 38px !important;
          height: 38px !important;
          display: flex !important;
          align-items: center !important;
        }

        /* 下拉箭头 - 放到内部右侧 */
        .semi-select-arrow,
        .semi-select .semi-select-arrow {
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 1 !important;
        }

        .semi-select:hover .semi-select-selection {
          background-color: #f3f4f6 !important;
          border-color: #9ca3af !important;
        }

        .semi-select-focus .semi-select-selection,
        .semi-select-selection-focus {
          background-color: #f3f4f6 !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* TextArea 样式优化 */
        .semi-input-textarea textarea {
          background-color: white !important;
          font-size: 14px !important;
          min-height: 120px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 6px !important;
          transition: all 0.2s ease;
        }

        .semi-input-textarea textarea:hover {
          background-color: #f3f4f6 !important;
          border-color: #9ca3af !important;
        }

        .semi-input-textarea textarea:focus {
          background-color: #f3f4f6 !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Password输入框样式 */
        .semi-input-wrapper-password input {
          background-color: white !important;
          height: 42px !important;
        }

        .semi-input-wrapper-password:focus-within input {
          background-color: #f3f4f6 !important;
        }
      `}</style>
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
          initValue="text_generation"
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
            <Form.Checkbox field="functionCall" initValue={true}>
              启用Function Call功能
            </Form.Checkbox>
          </div>
        )}

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
      </div>

      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">详细配置</h2>

        <Form.Input
          label="模型名称"
          field="modelName"
          rules={[{ required: true, message: '请输入模型名称' }]}
          placeholder="例如：qwen-max-2025"
        />

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

      {/* 常规设置 */}
      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h2 className="text-base font-medium mb-4">常规设置</h2>
        <div className="grid grid-cols-2 gap-4">
          <Form.Input
            label="温度 (Temperature)"
            field="temperature"
            placeholder="0-2之间的数值，例如：0.7"
            type="number"
            min="0"
            max="2"
            step="0.1"
          />
          <Form.Input
            label="最大token长度"
            field="maxTokens"
            placeholder="例如：128000"
            type="number"
            min="1"
          />
          <Form.Input
            label="Top P"
            field="topP"
            placeholder="0-1之间的数值，例如：1"
            type="number"
            min="0"
            max="1"
            step="0.1"
          />
          <Form.Input
            label="Top K"
            field="topK"
            placeholder="例如：0"
            type="number"
            min="0"
          />
        </div>
      </div>

      {/* 高级设置 */}
      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">高级设置</h2>
          <Button
            type="tertiary"
            size="small"
            onClick={onToggleAdvancedSettings}
          >
            {showAdvancedSettings ? '隐藏高级设置' : '显示高级设置'}
          </Button>
        </div>

        {showAdvancedSettings && (
          <>
            <div className="mb-4">
              <Form.RadioGroup
                label="输出格式 (Response Format)"
                field="responseFormat"
                initValue="text"
              >
                <Radio value="text">文本 (Text)</Radio>
                <Radio value="json">JSON</Radio>
                <Radio value="markdown">Markdown</Radio>
              </Form.RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Form.Input
                label="频率惩罚 (Frequency Penalty)"
                field="frequencyPenalty"
                placeholder="0-2之间，例如：0"
                type="number"
                min="0"
                max="2"
                step="0.1"
              />
              <Form.Input
                label="存在惩罚 (Presence Penalty)"
                field="presencePenalty"
                placeholder="0-2之间，例如：0"
                type="number"
                min="0"
                max="2"
                step="0.1"
              />
              <Form.Input
                label="超时时间 (秒)"
                field="timeout"
                placeholder="例如：10"
                type="number"
                min="1"
              />
              <Form.Input
                label="停止序列 (Stop Sequences)"
                field="stopSequences"
                placeholder="多个值用逗号分隔，例如：stop1,stop2"
              />
              <Form.Input
                label="种子值 (Seed)"
                field="seed"
                placeholder="可选，用于可重现的输出"
                type="number"
              />
            </div>

            {/* OpenAI 特定配置 */}
            {console.log("OpenAI check:", "currentProtocol:", currentProtocol, "selectedProvider:", selectedProvider, "match:", (currentProtocol?.toLowerCase() === 'openai' || selectedProvider?.toLowerCase() === 'openai' || selectedProvider?.toLowerCase() === 'gpt'))}
            {(currentProtocol?.toLowerCase() === 'openai' || selectedProvider?.toLowerCase() === 'openai' || selectedProvider?.toLowerCase() === 'gpt') && (
              <div className="border-t pt-4 mb-4">
                <h3 className="text-sm font-medium mb-3 text-gray-700">OpenAI / Azure 配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Form.Checkbox field="azureMode">
                      使用 Azure OpenAI 服务
                    </Form.Checkbox>
                  </div>
                  <Form.Input
                    label="API 版本 (Azure)"
                    field="apiVersion"
                    placeholder="例如：2024-02-15-preview"
                  />
                </div>
              </div>
            )}

            {/* ARK 特定配置 */}
            {(currentProtocol === 'ark' || selectedProvider?.toLowerCase() === 'ark') && (
              <div className="border-t pt-4 mb-4">
                <h3 className="text-sm font-medium mb-3 text-gray-700">ARK / 豆包 配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Input
                    label="区域 (Region)"
                    field="arkRegion"
                    placeholder="例如：cn-beijing"
                  />
                  <Form.Input
                    label="重试次数"
                    field="arkRetryTimes"
                    placeholder="例如：3"
                    type="number"
                    min="0"
                  />
                  <Form.Input
                    label="Access Key"
                    field="arkAccessKey"
                    placeholder="ARK Access Key"
                  />
                  <Form.Input
                    label="Secret Key"
                    field="arkSecretKey"
                    placeholder="ARK Secret Key"
                    type="password"
                  />
                </div>
              </div>
            )}

            {/* Claude 特定配置 */}
            {(currentProtocol === 'claude' || selectedProvider?.toLowerCase() === 'claude') && (
              <div className="border-t pt-4 mb-4">
                <h3 className="text-sm font-medium mb-3 text-gray-700">Claude / AWS Bedrock 配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Form.Checkbox field="claudeBedrock">
                      使用 AWS Bedrock 服务
                    </Form.Checkbox>
                  </div>
                  <Form.Input
                    label="AWS Access Key"
                    field="claudeAccessKey"
                    placeholder="AWS Access Key ID"
                  />
                  <Form.Input
                    label="AWS Secret Key"
                    field="claudeSecretKey"
                    placeholder="AWS Secret Access Key"
                    type="password"
                  />
                  <Form.Input
                    label="AWS Session Token"
                    field="claudeSessionToken"
                    placeholder="可选，用于临时凭证"
                  />
                  <Form.Input
                    label="AWS 区域"
                    field="claudeRegion"
                    placeholder="例如：us-east-1"
                  />
                  <Form.Input
                    label="Token 预算限制"
                    field="claudeBudgetTokens"
                    placeholder="例如：100000，0表示不限制"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* QWEN 特定配置 - JSON Schema */}
            {console.log("QWEN check:", "currentProtocol:", currentProtocol, "selectedProvider:", selectedProvider, "match:", (currentProtocol?.toLowerCase() === 'qwen' || selectedProvider?.toLowerCase() === 'qwen'))}
            {(currentProtocol?.toLowerCase() === 'qwen' || selectedProvider?.toLowerCase() === 'qwen') && (
              <div className="border-t pt-4 mb-4">
                <h3 className="text-sm font-medium mb-3 text-gray-700">QWEN JSON Schema 定义（可选）</h3>
                <Form.TextArea
                  field="qwenJsonSchema"
                  placeholder='{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "number"}}}'
                  rows={6}
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  定义 JSON 输出的结构，符合 JSON Schema 规范
                </p>
              </div>
            )}

            {/* OpenAI 特定配置 - JSON Schema */}
            {(currentProtocol?.toLowerCase() === 'openai' || selectedProvider?.toLowerCase() === 'openai' || selectedProvider?.toLowerCase() === 'gpt') && (
              <div className="border-t pt-4 mb-4">
                <h3 className="text-sm font-medium mb-3 text-gray-700">OpenAI JSON Schema 定义（可选）</h3>
                <Form.TextArea
                  field="openaiJsonSchema"
                  placeholder='{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "number"}}}'
                  rows={6}
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  定义 JSON 输出的结构，符合 JSON Schema 规范
                </p>
              </div>
            )}
          </>
        )}
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
    </>
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
    showAdvancedSettings,
    setShowAdvancedSettings,
    selectedProvider,
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

            // 更新模板配置
            const currentValues = formApi?.getValues() || {};

            // 构建需要更新的字段
            const updates = {
              name: currentValues.name || template.name,  // 使用基本信息中的"名称"
              meta: {
                name: currentValues.modelName || modelValue,  // 使用详细配置中的"模型名称"
                conn_config: {
                  api_key: currentValues.apiKey || '',
                  model: currentValues.modelName || modelValue,  // 使用详细配置中的"模型名称"
                },
              },
            };

            // 使用深度合并，保留模板中的其他字段
            const updatedTemplate = deepMerge(template, updates);
            setModelConfig(JSON.stringify(updatedTemplate, null, JSON_INDENT));

            // 自动填充各个字段（如果模板中有）
            if (template.meta?.conn_config?.base_url && formApi) {
              formApi.setValue('baseUrl', template.meta.conn_config.base_url);
            }
            if (template.meta?.conn_config?.temperature !== undefined && formApi) {
              formApi.setValue('temperature', template.meta.conn_config.temperature);
            }
            if (template.meta?.capability?.max_tokens !== undefined && formApi) {
              formApi.setValue('maxTokens', template.meta.capability.max_tokens);
            }
            if (template.meta?.conn_config?.top_p !== undefined && formApi) {
              formApi.setValue('topP', template.meta.conn_config.top_p);
            }
            if (template.meta?.conn_config?.top_k !== undefined && formApi) {
              formApi.setValue('topK', template.meta.conn_config.top_k);
            }
            if (template.meta?.conn_config?.frequency_penalty !== undefined && formApi) {
              formApi.setValue('frequencyPenalty', template.meta.conn_config.frequency_penalty);
            }
            if (template.meta?.conn_config?.presence_penalty !== undefined && formApi) {
              formApi.setValue('presencePenalty', template.meta.conn_config.presence_penalty);
            }
            if (template.meta?.conn_config?.timeout && formApi) {
              const timeoutSeconds = parseInt(String(template.meta.conn_config.timeout).replace(/[^\d]/g, ''));
              formApi.setValue('timeout', timeoutSeconds);
            }
            if (template.meta?.conn_config?.stop && Array.isArray(template.meta.conn_config.stop) && formApi) {
              formApi.setValue('stopSequences', template.meta.conn_config.stop.join(','));
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

          // 自动填充各个字段
          if (template.meta?.conn_config?.base_url && formApi) {
            formApi.setValue('baseUrl', template.meta.conn_config.base_url);
          }
          if (template.meta?.conn_config?.temperature !== undefined && formApi) {
            formApi.setValue('temperature', template.meta.conn_config.temperature);
          }
          if (template.meta?.capability?.max_tokens !== undefined && formApi) {
            formApi.setValue('maxTokens', template.meta.capability.max_tokens);
          }
          if (template.meta?.conn_config?.top_p !== undefined && formApi) {
            formApi.setValue('topP', template.meta.conn_config.top_p);
          }
          if (template.meta?.conn_config?.top_k !== undefined && formApi) {
            formApi.setValue('topK', template.meta.conn_config.top_k);
          }
          if (template.meta?.conn_config?.frequency_penalty !== undefined && formApi) {
            formApi.setValue('frequencyPenalty', template.meta.conn_config.frequency_penalty);
          }
          if (template.meta?.conn_config?.presence_penalty !== undefined && formApi) {
            formApi.setValue('presencePenalty', template.meta.conn_config.presence_penalty);
          }
          if (template.meta?.conn_config?.timeout && formApi) {
            const timeoutSeconds = parseInt(String(template.meta.conn_config.timeout).replace(/[^\d]/g, ''));
            formApi.setValue('timeout', timeoutSeconds);
          }
          if (template.meta?.conn_config?.stop && Array.isArray(template.meta.conn_config.stop) && formApi) {
            formApi.setValue('stopSequences', template.meta.conn_config.stop.join(','));
          }

          // 更新JSON配置
          const currentValues = formApi?.getValues() || {};

          // 构建需要更新的字段
          const updates = {
            name: currentValues.name || template.name,  // 使用基本信息中的"名称"
            meta: {
              name: currentValues.modelName || modelValue,  // 使用详细配置中的"模型名称"
              conn_config: {
                api_key: currentValues.apiKey || '',
                model: currentValues.modelName || modelValue,  // 使用详细配置中的"模型名称"
              },
            },
          };

          // 使用深度合并，保留模板中的其他字段
          const updatedTemplate = deepMerge(template, updates);
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
      name: values.name,  // 使用基本信息中的"名称"
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
        name: values.modelName || values.baseModel,  // 使用详细配置中的"模型名称"
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
          model: values.modelName || values.baseModel,  // 使用详细配置中的"模型名称"
          temperature: values.temperature ? Number(values.temperature) : DEFAULT_TEMPERATURE,
          max_tokens: DEFAULT_OUTPUT_TOKENS,
          top_p: values.topP ? Number(values.topP) : 1,
          top_k: values.topK ? Number(values.topK) : 0,
          frequency_penalty: values.frequencyPenalty ? Number(values.frequencyPenalty) : 0,
          presence_penalty: values.presencePenalty ? Number(values.presencePenalty) : 0,
          timeout: values.timeout ? `${values.timeout}s` : '10s',
          stop: values.stopSequences ? String(values.stopSequences).split(',').map(s => s.trim()).filter(Boolean) : [],
          ...(values.seed !== undefined && values.seed !== '' && { seed: Number(values.seed) }),
          // Response Format - 根据不同的 protocol 添加
          ...(values.provider === 'deepseek' && values.responseFormat && {
            deepseek: {
              response_format_type: values.responseFormat || 'text'
            }
          }),
          ...(values.provider === 'ark' && {
            ark: {
              ...(values.responseFormat && { response_format_type: values.responseFormat || 'text' }),
              ...(values.arkRegion && { region: values.arkRegion }),
              ...(values.arkAccessKey && { access_key: values.arkAccessKey }),
              ...(values.arkSecretKey && { secret_key: values.arkSecretKey }),
              ...(values.arkRetryTimes !== undefined && values.arkRetryTimes !== '' && { retry_times: Number(values.arkRetryTimes) }),
            }
          }),
          ...(values.provider === 'openai' && {
            openai: {
              ...(values.responseFormat && {
                response_format: {
                  type: values.responseFormat || 'text',
                  jsonschema: values.openaiJsonSchema ? JSON.parse(values.openaiJsonSchema as string) : null
                }
              }),
              ...(values.azureMode !== undefined && { by_azure: Boolean(values.azureMode) }),
              ...(values.apiVersion && { api_version: values.apiVersion }),
            }
          }),
          ...(values.provider === 'claude' && {
            claude: {
              ...(values.claudeBedrock !== undefined && { by_bedrock: Boolean(values.claudeBedrock) }),
              ...(values.claudeAccessKey && { access_key: values.claudeAccessKey }),
              ...(values.claudeSecretKey && { secret_access_key: values.claudeSecretKey }),
              ...(values.claudeSessionToken && { session_token: values.claudeSessionToken }),
              ...(values.claudeRegion && { region: values.claudeRegion }),
              ...(values.claudeBudgetTokens !== undefined && values.claudeBudgetTokens !== '' && { budget_tokens: Number(values.claudeBudgetTokens) }),
            }
          }),
          ...(values.provider === 'qwen' && {
            qwen: {
              ...(values.responseFormat && {
                response_format: {
                  type: values.responseFormat || 'text',
                  jsonschema: values.qwenJsonSchema ? JSON.parse(values.qwenJsonSchema as string) : null
                }
              }),
            }
          }),
        },
      },
    };

    return JSON.stringify(config, null, JSON_INDENT);
  };

  // 当表单值变化时，更新JSON配置
  const handleFormChange = (values: Record<string, unknown>) => {
    console.log('=== 表单变化调试 ===');
    console.log('表单值:', values);
    console.log('名称字段值:', values.name);
    console.log('当前customModelName:', customModelName);
    
    // 更新自定义模型名称（用于本地模型）
    if (values.name !== undefined) {
      const newModelName = String(values.name || '');
      console.log('设置自定义模型名称:', newModelName);
      setCustomModelName(newModelName);
      
      // 如果是本地厂商且名称改变了，清除当前选中的基础模型
      if (isLocalProvider && newModelName !== customModelName) {
        console.log('本地厂商名称变化，清除基础模型选择');
        if (formApi) {
          formApi.setValue('baseModel', '');
        }
      }
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

          // 构建需要更新的字段
          const updates = {
            name: values.name,  // 使用基本信息中的"名称"
            meta: {
              name: values.modelName || values.baseModel,  // 使用详细配置中的"模型名称"
              capability: {
                function_call:
                  values.modelType === 'text_generation'
                    ? values.functionCall || false
                    : false,
                ...(values.maxTokens !== undefined && { max_tokens: Number(values.maxTokens) }),
              },
              conn_config: {
                base_url: values.baseUrl,
                api_key: values.apiKey,
                model: values.modelName || values.baseModel,  // 使用详细配置中的"模型名称"
                ...(values.temperature !== undefined && { temperature: Number(values.temperature) }),
                ...(values.topP !== undefined && { top_p: Number(values.topP) }),
                ...(values.topK !== undefined && { top_k: Number(values.topK) }),
                ...(values.frequencyPenalty !== undefined && { frequency_penalty: Number(values.frequencyPenalty) }),
                ...(values.presencePenalty !== undefined && { presence_penalty: Number(values.presencePenalty) }),
                ...(values.timeout !== undefined && { timeout: `${values.timeout}s` }),
                ...(values.stopSequences && { stop: String(values.stopSequences).split(',').map(s => s.trim()).filter(Boolean) }),
                ...(values.seed !== undefined && values.seed !== '' && { seed: Number(values.seed) }),
                // DeepSeek specific
                ...(currentConfig.meta?.protocol === 'deepseek' && {
                  deepseek: {
                    ...currentConfig.meta?.conn_config?.deepseek,
                    ...(values.responseFormat && { response_format_type: values.responseFormat })
                  }
                }),
                // ARK specific
                ...(currentConfig.meta?.protocol === 'ark' && {
                  ark: {
                    ...currentConfig.meta?.conn_config?.ark,
                    ...(values.responseFormat && { response_format_type: values.responseFormat }),
                    ...(values.arkRegion !== undefined && { region: values.arkRegion }),
                    ...(values.arkAccessKey !== undefined && { access_key: values.arkAccessKey }),
                    ...(values.arkSecretKey !== undefined && { secret_key: values.arkSecretKey }),
                    ...(values.arkRetryTimes !== undefined && values.arkRetryTimes !== '' && { retry_times: Number(values.arkRetryTimes) }),
                  }
                }),
                // OpenAI specific
                ...(currentConfig.meta?.protocol === 'openai' && {
                  openai: {
                    ...currentConfig.meta?.conn_config?.openai,
                    ...(values.responseFormat && {
                      response_format: {
                        ...currentConfig.meta?.conn_config?.openai?.response_format,
                        type: values.responseFormat,
                        ...(values.openaiJsonSchema && { jsonschema: JSON.parse(values.openaiJsonSchema as string) }),
                      }
                    }),
                    ...(values.azureMode !== undefined && { by_azure: Boolean(values.azureMode) }),
                    ...(values.apiVersion !== undefined && { api_version: values.apiVersion }),
                  }
                }),
                // Claude specific
                ...(currentConfig.meta?.protocol === 'claude' && {
                  claude: {
                    ...currentConfig.meta?.conn_config?.claude,
                    ...(values.claudeBedrock !== undefined && { by_bedrock: Boolean(values.claudeBedrock) }),
                    ...(values.claudeAccessKey !== undefined && { access_key: values.claudeAccessKey }),
                    ...(values.claudeSecretKey !== undefined && { secret_access_key: values.claudeSecretKey }),
                    ...(values.claudeSessionToken !== undefined && { session_token: values.claudeSessionToken }),
                    ...(values.claudeRegion !== undefined && { region: values.claudeRegion }),
                    ...(values.claudeBudgetTokens !== undefined && values.claudeBudgetTokens !== '' && { budget_tokens: Number(values.claudeBudgetTokens) }),
                  }
                }),
                // QWEN specific
                ...(currentConfig.meta?.protocol === 'qwen' && {
                  qwen: {
                    ...currentConfig.meta?.conn_config?.qwen,
                    ...(values.responseFormat && {
                      response_format: {
                        ...currentConfig.meta?.conn_config?.qwen?.response_format,
                        type: values.responseFormat,
                        ...(values.qwenJsonSchema && { jsonschema: JSON.parse(values.qwenJsonSchema as string) }),
                      }
                    }),
                  }
                }),
              },
            },
          };

          // 使用深度合并，保留模板中的其他字段
          const updatedConfig = deepMerge(currentConfig, updates);
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
            selectedProvider={selectedProvider}
            availableModels={availableModels}
            modelConfig={modelConfig}
            isSaving={isSaving}
            spaceId={spaceId}
            showAdvancedSettings={showAdvancedSettings}
            onSubmit={handleSubmit}
            onFormChange={handleFormChange}
            onProviderChange={handleProviderChange}
            onModelTypeChange={handleModelTypeChange}
            onBaseModelChange={handleBaseModelChange}
            onFormApiReady={setFormApi}
            onModelConfigChange={setModelConfig}
            onToggleAdvancedSettings={() => setShowAdvancedSettings(!showAdvancedSettings)}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}


