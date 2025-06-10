import { useEffect, useState, useMemo } from 'react';

import { useMemoizedFn } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { CreateEnv } from '@coze-arch/bot-api/workflow_api';
import { intelligenceApi } from '@coze-arch/bot-api';
import {
  useProjectId,
  useListenMessageEvent,
  CONVERSATION_URI,
  type MessageEvent,
} from '@coze-project-ide/framework';

import {
  DEFAULT_CONNECTOR,
  DEBUG_CONNECTOR_ID,
  COZE_CONNECTOR_ID,
  COZE_CONNECTOR_IDS,
  ALLOW_CONNECTORS,
} from '../constants';

interface Connector {
  connectorId: string;
  connectorName?: string;
}

export const useConnectorList = () => {
  const projectId = useProjectId();

  const [connectorList, setConnectorList] = useState<Connector[]>([
    DEFAULT_CONNECTOR,
  ]);
  const [activeKey, setActiveKey] = useState(DEBUG_CONNECTOR_ID);

  const createEnv = useMemo(() => {
    if (activeKey === DEBUG_CONNECTOR_ID) {
      return CreateEnv.Draft;
    }
    return CreateEnv.Release;
  }, [activeKey]);

  const fetch = async () => {
    const res = await intelligenceApi.GetProjectPublishedConnector({
      project_id: projectId,
    });
    const data = res.data || [];
    let noCoze = true;
    const next = data
      .reduce((prev, current) => {
        if (!current.id) {
          return prev;
        }
        if (COZE_CONNECTOR_IDS.includes(current.id)) {
          if (noCoze) {
            prev.push({
              connectorId: COZE_CONNECTOR_ID,
              connectorName: I18n.t('platform_name'),
            });
            noCoze = false;
          }
        } else {
          prev.push({
            connectorId: current.id,
            connectorName: current.name,
          });
        }
        return prev;
      }, [] as Connector[])
      .filter(i => ALLOW_CONNECTORS.includes(i.connectorId));
    setConnectorList([DEFAULT_CONNECTOR, ...next]);
  };

  const handleTabChange = (v: string) => {
    setActiveKey(v);
  };

  const listener = useMemoizedFn((e: MessageEvent) => {
    if (e.name === 'tab' && e.data?.value === 'testrun') {
      setActiveKey(DEBUG_CONNECTOR_ID);
    }
  });

  useListenMessageEvent(CONVERSATION_URI, listener);

  useEffect(() => {
    fetch();
  }, []);

  return {
    connectorList,
    activeKey,
    createEnv,
    onTabChange: handleTabChange,
  };
};
