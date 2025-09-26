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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Select, Toast } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import { useGlobalState } from '@/hooks';
import {
  Section,
  useField,
  useForm,
  useWatch,
  withField,
} from '@/form';

import {
  AGENT_BINDING_PATH,
  AGENT_ID_PATH,
  AGENT_KEY_PATH,
  AGENT_METADATA_PATH,
  AGENT_NAME_PATH,
  AGENT_URL_PATH,
  PLATFORM_PATH,
} from '../constants';

type SelectValue = string | number | Record<string, unknown> | undefined;

interface AgentBindingOption {
  value: string;
  label: string;
  description?: string | null;
  agentUrl?: string;
  agentKey?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  platform: string;
  raw?: Record<string, unknown>;
}

const SUPPORTED_PLATFORMS = new Set(['coze', 'hiagent']);

function formatError(message: unknown) {
  if (message instanceof Error) {
    return message.message;
  }
  return typeof message === 'string' ? message : 'unknown error';
}

async function fetchHiAgentOptions(
  spaceId: string,
  signal: AbortSignal,
): Promise<AgentBindingOption[]> {
  const response = await fetch(
    `/api/space/${spaceId}/hi-agents?page_size=200`,
    {
      method: 'GET',
      signal,
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result || result.code !== 0) {
    throw new Error(result?.msg ?? 'Failed to fetch HiAgent list');
  }

  const agents = Array.isArray(result.agents) ? result.agents : [];
  return agents
    .map((item: Record<string, unknown>) => {
      const id = item?.id;
      const value = id != null ? String(id) : undefined;
      if (!value) {
        return undefined;
      }
      const label =
        typeof item?.name === 'string' && item.name
          ? item.name
          : I18n.t('agent_binding_default_name', {}, '未命名智能体');
      const description =
        typeof item?.description === 'string' ? item.description : undefined;
      return {
        value,
        label,
        description,
        agentUrl: typeof item?.agent_url === 'string' ? item.agent_url : '',
        agentKey: typeof item?.agent_key === 'string' ? item.agent_key : null,
        agentId: typeof item?.agent_id === 'string' ? item.agent_id : null,
        agentName: label,
        platform: 'hiagent',
        raw: item,
      } satisfies AgentBindingOption;
    })
    .filter(Boolean) as AgentBindingOption[];
}

async function fetchCozeAgentOptions(
  spaceId: string,
  signal: AbortSignal,
): Promise<AgentBindingOption[]> {
  const payload = {
    space_id: spaceId,
    name: '',
    status: [1, 3, 4],
    types: [1, 2],
    search_scope: 0,
    order_by: 0,
    size: 200,
  };

  const response = await fetch(
    '/api/intelligence_api/search/get_draft_intelligence_list',
    {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result?.code != null && result.code !== 0) {
    throw new Error(result?.msg ?? 'Failed to fetch Coze agents');
  }

  const intelligences =
    Array.isArray(result?.data?.intelligences) &&
    result.data.intelligences.length > 0
      ? result.data.intelligences
      : [];

  return intelligences
    .map((item: Record<string, unknown>) => {
      const basic = item?.basic_info as Record<string, unknown> | undefined;
      const id = basic?.id;
      const value = id != null ? String(id) : undefined;
      if (!value) {
        return undefined;
      }
      const label =
        typeof basic?.name === 'string' && basic.name
          ? basic.name
          : I18n.t('agent_binding_default_name', {}, '未命名智能体');
      const description =
        typeof basic?.description === 'string' ? basic.description : undefined;
      return {
        value,
        label,
        description,
        agentUrl: `coze://${value}`,
        agentKey: null,
        agentId: value,
        agentName: label,
        platform: 'coze',
        raw: item,
      } satisfies AgentBindingOption;
    })
    .filter(Boolean) as AgentBindingOption[];
}

function AgentBindingComponent({
  title = I18n.t('agent_binding_select_title', {}, '选择智能体实例'),
  tooltip = I18n.t(
    'agent_binding_select_tooltip',
    {},
    '根据平台选择可直接调用的智能体实例',
  ),
}: {
  title?: string;
  tooltip?: string;
}) {
  const form = useForm();
  const { value, onChange, readonly, name } = useField<string | undefined>();
  const platform = useWatch<string>(PLATFORM_PATH);
  const { spaceId } = useGlobalState(false);

  const [options, setOptions] = useState<AgentBindingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const formRef = useRef(form);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const spaceWarningShownRef = useRef(false);
  const previousPlatformRef = useRef<string | undefined>(undefined);
  const previousSpaceIdRef = useRef<string | undefined>(undefined);

  formRef.current = form;
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    spaceWarningShownRef.current = false;
  }, [spaceId]);

  useEffect(() => {
    const currentForm = formRef.current;
    const previousPlatform = previousPlatformRef.current;
    const previousSpaceId = previousSpaceIdRef.current;

    const clearSelection = (resetBindingValue: boolean) => {
      if (!currentForm) {
        return;
      }

      if (resetBindingValue && valueRef.current !== undefined) {
        onChangeRef.current?.(undefined);
        valueRef.current = undefined;
      }

      const ensureValue = (path: string, target: unknown) => {
        const current = currentForm.getValueIn(path);
        const normalizedCurrent = current === null ? undefined : current;
        const normalizedTarget = target === null ? undefined : target;
        if (normalizedCurrent !== normalizedTarget) {
          currentForm.setValueIn(path, target);
        }
      };

      ensureValue(AGENT_URL_PATH, '');
      ensureValue(AGENT_ID_PATH, undefined);
      ensureValue(AGENT_NAME_PATH, undefined);
      ensureValue(AGENT_KEY_PATH, '');
      ensureValue(AGENT_METADATA_PATH, undefined);
    };

    abortRef.current?.abort();

    const isSupported = Boolean(platform && SUPPORTED_PLATFORMS.has(platform));
    const platformChanged =
      previousPlatform !== undefined && previousPlatform !== platform;
    const spaceChanged =
      previousSpaceId !== undefined && previousSpaceId !== spaceId;

    if (!isSupported) {
      if (platformChanged || spaceChanged) {
        clearSelection(true);
        setOptions([]);
      }
      setLoading(false);
      previousPlatformRef.current = platform;
      previousSpaceIdRef.current = spaceId;
      return () => {
        /* noop */
      };
    }

    if (!spaceId) {
      if (!spaceWarningShownRef.current) {
        Toast.warning(
          I18n.t(
            'agent_binding_missing_space',
            {},
            '缺少空间信息，无法拉取智能体列表',
          ),
        );
        spaceWarningShownRef.current = true;
      }
      setLoading(false);
      previousPlatformRef.current = platform;
      previousSpaceIdRef.current = spaceId;
      return () => {
        /* noop */
      };
    }

    if (platformChanged || spaceChanged) {
      clearSelection(true);
      setOptions([]);
    }

    previousPlatformRef.current = platform;
    previousSpaceIdRef.current = spaceId;

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const fetcher =
      platform === 'hiagent' ? fetchHiAgentOptions : fetchCozeAgentOptions;

    fetcher(spaceId, controller.signal)
      .then(fetchedOptions => {
        if (!controller.signal.aborted) {
          setOptions(fetchedOptions);
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          Toast.error(
            I18n.t(
              'agent_binding_fetch_failed',
              { message: formatError(error) },
              '获取智能体列表失败：{message}',
            ),
          );
          setOptions([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [platform, spaceId]);

  const optionLookup = useMemo(() => {
    return new Map(options.map(option => [option.value, option]));
  }, [options]);

  const handleChange = useCallback(
    (selected: SelectValue) => {
      const currentForm = formRef.current;
      const change = onChangeRef.current;
      if (!currentForm || !change) {
        return;
      }

      const setIfDifferent = (path: string, newValue: unknown) => {
        const current = currentForm.getValueIn(path);
        const normalizedCurrent = current === null ? undefined : current;
        const normalizedTarget = newValue === null ? undefined : newValue;
        if (normalizedCurrent !== normalizedTarget) {
          currentForm.setValueIn(path, newValue);
        }
      };

      if (typeof selected !== 'string') {
        change(undefined);
        valueRef.current = undefined;
        setIfDifferent(AGENT_URL_PATH, '');
        setIfDifferent(AGENT_ID_PATH, undefined);
        setIfDifferent(AGENT_NAME_PATH, undefined);
        setIfDifferent(AGENT_KEY_PATH, '');
        setIfDifferent(AGENT_METADATA_PATH, undefined);
        return;
      }

      change(selected);
      valueRef.current = selected;

      const option = optionLookup.get(selected);
      if (!option) {
        setIfDifferent(AGENT_URL_PATH, '');
        setIfDifferent(AGENT_ID_PATH, selected);
        setIfDifferent(AGENT_NAME_PATH, undefined);
        setIfDifferent(AGENT_KEY_PATH, '');
        setIfDifferent(AGENT_METADATA_PATH, undefined);
        return;
      }

      setIfDifferent(AGENT_URL_PATH, option.agentUrl ?? '');
      setIfDifferent(AGENT_ID_PATH, option.agentId ?? selected);
      setIfDifferent(AGENT_NAME_PATH, option.agentName ?? option.label);
      setIfDifferent(AGENT_KEY_PATH, option.agentKey ?? '');
      setIfDifferent(AGENT_METADATA_PATH, option.raw);
    },
    [optionLookup],
  );

  const disabled =
    readonly || !platform || !SUPPORTED_PLATFORMS.has(platform) || loading;

  return (
    <Section title={title} tooltip={tooltip}>
      <Select
        name={name ?? AGENT_BINDING_PATH}
        value={value}
        disabled={disabled}
        loading={loading}
        placeholder={I18n.t(
          'agent_binding_select_placeholder',
          {},
          '请选择智能体实例',
        )}
        style={{ width: '100%' }}
        onChange={handleChange}
        filter
        showSearch
        noFoundContent={I18n.t(
          'agent_binding_empty_text',
          {},
          '暂无可用智能体，请先在对应平台创建',
        )}
      >
        {options.map(option => (
          <Select.Option key={option.value} value={option.value}>
            <span className="truncate block">{option.label}</span>
          </Select.Option>
        ))}
      </Select>
    </Section>
  );
}

export const AgentBindingField = withField(AgentBindingComponent, {
  name: AGENT_BINDING_PATH,
});
