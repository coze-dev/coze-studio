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

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import {
  IconCozPlus,
  IconCozStarFill,
  IconCozMore,
} from '@coze-arch/coze-design/icons';
import {
  Button,
  Avatar,
  IconButton,
  Dropdown,
  Select,
  Search,
} from '@coze-arch/coze-design';
import { listModels } from '@coze-arch/bot-space-api';

// 基于新的API定义的模型类型，但保持数字ID兼容现有组件逻辑
interface SpaceModel {
  id: number;
  name: string;
  description: string;
  context_length: number;
  protocol: string;
  icon_uri?: string;
  icon_url?: string;
}

interface ModelCardProps {
  model: SpaceModel;
  isEnabled: boolean;
  isFavorite: boolean;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onToggleFavorite: (id: number) => void;
  onToggleEnabled: (id: number, enabled: boolean) => void;
}

interface ModelFiltersProps {
  typeFilter: string;
  providerFilter: string;
  searchValue: string;
  onTypeFilterChange: (value: string) => void;
  onProviderFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const CONTEXT_LENGTH_DIVISOR = 1000;

function ModelDropdownMenu({
  modelId,
  isEnabled,
  onToggleEnabled,
}: {
  modelId: number;
  isEnabled: boolean;
  onToggleEnabled: (id: number, enabled: boolean) => void;
}) {
  return (
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={() => {
          onToggleEnabled(modelId, true);
          console.log('启用模型', modelId);
        }}
        disabled={isEnabled}
      >
        启用
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          onToggleEnabled(modelId, false);
          console.log('停用模型', modelId);
        }}
        disabled={!isEnabled}
      >
        停用
      </Dropdown.Item>
      <Dropdown.Item onClick={() => console.log('编辑模型', modelId)}>
        编辑
      </Dropdown.Item>
      <Dropdown.Item
        type="danger"
        onClick={() => console.log('删除模型', modelId)}
      >
        删除
      </Dropdown.Item>
    </Dropdown.Menu>
  );
}

function ModelCard({
  model,
  isEnabled,
  isFavorite,
  isHovered,
  onHover,
  onToggleFavorite,
  onToggleEnabled,
}: ModelCardProps) {
  return (
    <div
      key={model.id}
      className="flex-grow h-[158px] min-w-[280px] rounded-[6px] border-solid border-[1px] relative overflow-hidden transition duration-150 ease-out hover:shadow-[0_6px_8px_0_rgba(28,31,35,6%)] coz-stroke-primary coz-mg-card"
    >
      <div
        className="h-full w-full cursor-pointer flex flex-col gap-[12px] px-[16px] py-[16px]"
        onMouseEnter={() => onHover(model.id)}
        onMouseLeave={() => onHover(null)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-[12px] flex-1 min-w-0">
            <Avatar shape="square" style={{ width: 40, height: 40 }}>
              {model.icon_url || model.icon_uri ? (
                <img
                  src={model.icon_url || model.icon_uri}
                  alt={model.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<span style="font-size: 20px;">🤖</span>';
                    }
                  }}
                />
              ) : (
                <span style={{ fontSize: '20px' }}>🤖</span>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3
                className="text-[14px] font-medium coz-fg-primary truncate"
                title={model.name}
              >
                {model.name}
              </h3>
              <p
                className="text-[12px] coz-fg-secondary line-clamp-2 mt-[2px]"
                title={model.description}
              >
                {model.description || '暂无描述'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isEnabled ? '已启用' : '已停用'}
            </span>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-[4px] text-[12px]">
          <span className="coz-fg-tertiary">上下文长度</span>
          <span className="coz-fg-secondary">
            {model.context_length
              ? `${Math.floor(model.context_length / CONTEXT_LENGTH_DIVISOR)}K`
              : '未知'}
          </span>
          <span className="coz-fg-tertiary ml-[8px]">厂商</span>
          <span className="coz-fg-secondary">{model.protocol}</span>
        </div>

        {isHovered ? (
          <>
            <div
              className="absolute bottom-[16px] right-[16px] w-[100px] h-[16px]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 21.38%)',
              }}
            />

            <div
              className="absolute bottom-[16px] right-[16px] flex gap-[4px]"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <IconButton
                icon={<IconCozStarFill />}
                onClick={() => onToggleFavorite(model.id)}
                className={isFavorite ? 'coz-fg-hglt-yellow' : ''}
              />

              <Dropdown
                trigger="click"
                position="bottomRight"
                render={
                  <ModelDropdownMenu
                    modelId={model.id}
                    isEnabled={isEnabled}
                    onToggleEnabled={onToggleEnabled}
                  />
                }
              >
                <IconButton icon={<IconCozMore />} />
              </Dropdown>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ModelFilters({
  typeFilter,
  providerFilter,
  searchValue,
  onTypeFilterChange,
  onProviderFilterChange,
  onSearchChange,
}: ModelFiltersProps) {
  return (
    <div className="flex items-center justify-between px-[24px] pb-[12px] border-b coz-stroke-secondary">
      <div className="flex items-center gap-[8px]">
        <Select
          className="min-w-[128px]"
          size="small"
          value={typeFilter}
          onChange={val => onTypeFilterChange(val as string)}
        >
          <Select.Option value="all">全部</Select.Option>
          <Select.Option value="llm">LLM</Select.Option>
          <Select.Option value="embedding">EMBEDDING</Select.Option>
          <Select.Option value="rerank">RERANK</Select.Option>
          <Select.Option value="tts">TTS</Select.Option>
        </Select>

        <Select
          className="min-w-[128px]"
          size="small"
          value={providerFilter}
          onChange={val => onProviderFilterChange(val as string)}
        >
          <Select.Option value="all">全部</Select.Option>
          <Select.Option value="openai">OPENAI</Select.Option>
          <Select.Option value="gemini">GEMINI</Select.Option>
          <Select.Option value="deepseek">DEEPSEEK</Select.Option>
          <Select.Option value="qwen">QWEN</Select.Option>
        </Select>
      </div>

      <Search
        showClear={true}
        className="w-[200px]"
        placeholder="搜索模型"
        value={searchValue}
        onChange={val => onSearchChange(val)}
      />
    </div>
  );
}

function useModelData(spaceId: string) {
  const [models, setModels] = useState<SpaceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelStates, setModelStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        // 直接使用新的模型管理API，传入space_id进行过滤
        const modelsData = await listModels({ space_id: spaceId });

        if (modelsData) {
          // 将ModelDetailOutput转换为SpaceModel
          const convertedModels: SpaceModel[] = modelsData.map(model => ({
            id: parseInt(model.id) || 0, // 将string id转换为number
            name: model.name || '',
            description: Object.values(model.description || {})[0] || '',
            context_length: model.meta?.capability?.max_tokens || 0,
            protocol: model.meta?.protocol || '',
            icon_uri: model.icon_uri,
            icon_url: model.icon_url,
          }));

          setModels(convertedModels);

          const initialStates: Record<number, boolean> = {};
          convertedModels.forEach((model: SpaceModel) => {
            initialStates[model.id] = true;
          });
          setModelStates(initialStates);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (spaceId && spaceId !== '0') {
      fetchModels();
    }
  }, [spaceId]);

  return { models, loading, error, modelStates, setModelStates };
}

interface FilterCriteria {
  searchValue: string;
  typeFilter: string;
  providerFilter: string;
}

function filterModels(models: SpaceModel[], filters: FilterCriteria) {
  return models.filter(model => {
    if (
      filters.searchValue &&
      !model.name.toLowerCase().includes(filters.searchValue.toLowerCase()) &&
      !model.description
        .toLowerCase()
        .includes(filters.searchValue.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.providerFilter !== 'all' &&
      model.protocol.toLowerCase() !== filters.providerFilter.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

export default function SpaceModelConfigPage() {
  const { space_id } = useParams<{ space_id: string }>();
  const spaceId = space_id || '0';

  const { models, loading, error, modelStates, setModelStates } =
    useModelData(spaceId);
  const [hoveredModelId, setHoveredModelId] = useState<number | null>(null);
  const [favoriteModels, setFavoriteModels] = useState<Set<number>>(new Set());
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');

  const handleToggleFavorite = (modelId: number) => {
    setFavoriteModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleToggleEnabled = (modelId: number, enabled: boolean) => {
    setModelStates(prev => ({
      ...prev,
      [modelId]: enabled,
    }));
  };

  const filteredModels = filterModels(models, {
    searchValue,
    typeFilter,
    providerFilter,
  });

  return (
    <div className="flex flex-col h-full">
      <div>
        <div className="flex items-center justify-between px-[24px] py-[16px]">
          <h1 className="text-[20px] font-medium coz-fg-primary">模型配置</h1>
          <Button
            type="primary"
            theme="solid"
            icon={<IconCozPlus />}
            onClick={() => {
              console.log('添加模型按钮被点击');
            }}
          >
            添加模型
          </Button>
        </div>

        <ModelFilters
          typeFilter={typeFilter}
          providerFilter={providerFilter}
          searchValue={searchValue}
          onTypeFilterChange={setTypeFilter}
          onProviderFilterChange={setProviderFilter}
          onSearchChange={setSearchValue}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="text-red-800">
              <strong>错误:</strong> {error}
            </div>
          </div>
        ) : null}

        {!loading && !error && (
          <div>
            {filteredModels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchValue || typeFilter !== 'all' || providerFilter !== 'all'
                  ? '没有找到匹配的模型'
                  : '当前空间暂无可用模型'}
              </div>
            ) : (
              <div className="grid grid-cols-3 auto-rows-min gap-[20px] [@media(min-width:1600px)]:grid-cols-4">
                {filteredModels.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isEnabled={modelStates[model.id]}
                    isFavorite={favoriteModels.has(model.id)}
                    isHovered={hoveredModelId === model.id}
                    onHover={setHoveredModelId}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleEnabled={handleToggleEnabled}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
