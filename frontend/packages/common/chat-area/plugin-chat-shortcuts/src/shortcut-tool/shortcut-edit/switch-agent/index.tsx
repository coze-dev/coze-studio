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

import React, { type RefObject, useMemo, useRef, useState } from 'react';

import cls from 'classnames';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { type Agent } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type Form, Popover, Typography, Input } from '@coze-arch/bot-semi';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { IconChevronDown } from '@douyinfe/semi-icons';

import styles from '../index.module.less';
import FieldLabel from '../components/field-label';
import type { ShortcutEditFormValues } from '../../types';
import { type ItemType } from '../../../utils/data-helper';
import { LoadMoreList } from '../../../components/load-more-list';
import SelectCheck from '../../../assets/select-check.png';
import AgentIcon from '../../../assets/agent-icon.png';

const { Text } = Typography;

const PAGE_SIZE = 10;

interface ResultData {
  list: {
    agentName: string;
    agentId: string;
  }[];
  hasMore: boolean;
}

export interface SwitchAgentProps {
  formRef: RefObject<Form>;
  showPanel: boolean;
  agents: Agent[];
  editedShortcut: ShortcutEditFormValues;
}

export const SwitchAgent = (props: SwitchAgentProps) => {
  const { formRef, showPanel, editedShortcut, agents } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<Popover>(null);
  const [isShowLoadMoreList, setIsShowLoadMoreList] = useState(false);
  const { defaultAgentId, defaultName } = useMemo(() => {
    if (!editedShortcut.agent_id) {
      return {
        defaultAgentId: '',
        // @ts-expect-error -- replace later
        defaultName: I18n.t('Do not specify'),
      };
    }
    return {
      defaultAgentId: editedShortcut.agent_id,
      defaultName:
        agents.find(agent => agent.id === editedShortcut.agent_id)?.name ?? '',
    };
  }, [editedShortcut.agent_id]);
  const [inputValue, setInputValue] = useState(defaultName);

  return (
    <>
      <Popover
        ref={popRef}
        content={
          <AgentLoadMoreList
            defaultSelectedId={defaultAgentId}
            showPanel={showPanel}
            onSelect={item => {
              formRef.current?.formApi.setValue('agent_id', item.agentId);
              setInputValue(item.agentName);
              setIsShowLoadMoreList(false);
            }}
          />
        }
        keepDOM
        onVisibleChange={setIsShowLoadMoreList}
        autoAdjustOverflow={false}
        position={'bottomLeft'}
        trigger="custom"
        visible={isShowLoadMoreList}
        onClickOutSide={() => setIsShowLoadMoreList(false)}
        onEscKeyDown={() => setIsShowLoadMoreList(false)}
      >
        <div
          className={cls(
            'w-full pb-[32px]',
            styles['switch-agent-input-wrapper'],
          )}
          onClick={() => {
            setIsShowLoadMoreList(!isShowLoadMoreList);
          }}
        >
          <FieldLabel>
            {I18n.t('multiagent_shortcut_modal_specify_node')}
          </FieldLabel>
          <Input
            ref={inputRef}
            suffix={<IconChevronDown />}
            className="w-full hover:!coz-mg-secondary-hovered active:!coz-mg-secondary-pressed"
            readonly={true}
            value={inputValue}
          />
        </div>
      </Popover>
    </>
  );
};

interface AgentLoadMoreListProps {
  onSelect: (item: ItemType<ResultData['list']>) => void;
  defaultSelectedId?: string;
  showPanel: boolean;
}

const AgentLoadMoreList = (props: AgentLoadMoreListProps) => {
  const { onSelect, showPanel, defaultSelectedId } = props;
  const [activeId, setActiveId] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const botId = useBotInfoStore(state => state.botId);
  const getSpaceId = () => useSpaceStore.getState().getSpaceId();

  return (
    <LoadMoreList<ItemType<ResultData['list']>>
      defaultId={defaultSelectedId}
      className={cls(
        'max-h-[122px] p-1 overflow-y-auto cursor-pointer overflow-x-hidden',
        styles['load-more-list'],
      )}
      style={{
        width: showPanel ? '687px' : '590px',
      }}
      getId={item => item.agentId}
      defaultList={[
        {
          agentId: '',
          agentName: I18n.t(
            'multiagent_shortcut_modal_specify_node_option_do_not_specify',
          ),
        },
      ]}
      getMoreListService={currentData => {
        const page = currentData
          ? Math.ceil(currentData.list.length / PAGE_SIZE) + 1
          : 1;
        return getAgentList({
          page,
          pageSize: PAGE_SIZE,
          botId,
          spaceId: getSpaceId(),
        });
      }}
      onActiveId={id => setActiveId(id)}
      onSelect={item => {
        setSelectedId(item.agentId);
      }}
      itemRender={item => (
        <AgentItem
          onClick={onSelect}
          activeId={activeId}
          selectedId={selectedId}
          data={item}
        />
      )}
    />
  );
};

interface AgentItemProps {
  activeId: string;
  selectedId: string;
  data: ItemType<ResultData['list']>;
  onClick?: (item: ItemType<ResultData['list']>) => void;
}

const AgentItem = (renderProps: AgentItemProps) => {
  const { onClick, activeId, data, selectedId } = renderProps;

  return (
    <div
      className={cls(
        'flex justify-start p-2 items-center h-8 cursor-pointer w-full',
        {
          'rounded border coz-stroke-plus coz-mg-secondary-hovered':
            activeId === data.agentId,
        },
      )}
      onClick={() => onClick?.(data)}
    >
      <img
        alt="checked"
        src={SelectCheck}
        className="w-4 h-4 ml-2"
        style={{
          visibility: [activeId, selectedId].includes(data.agentId)
            ? 'visible'
            : 'hidden',
        }}
      />
      <img alt="icon" src={AgentIcon} className="mr-2 w-4 h-4 ml-2" />
      <Text ellipsis className="w-full coz-fg-primary text-sm">
        {data.agentName}
      </Text>
    </div>
  );
};

const getAgentList = async (props: {
  botId: string;
  spaceId: string;
  page: number;
  pageSize: number;
}): Promise<ResultData> => {
  try {
    const { botId, spaceId, page, pageSize } = props;
    const res = await PlaygroundApi.GetShortcutAvailNodes({
      bot_id: botId,
      space_id: spaceId,
      page_num: page,
      page_size: pageSize,
    });
    const { nodes, has_more } = res.data;
    return {
      list: nodes.map(item => ({
        agentName: item.agent_name,
        agentId: item.agent_id,
      })),
      hasMore: has_more,
    };
  } catch (e) {
    console.error('getAgentListError', e);
    return {
      list: [],
      hasMore: false,
    };
  }
};
