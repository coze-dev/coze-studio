import { useEffect } from 'react';

import { useProjectPublishStore } from '@/store';
import { useBizConnectorAnchor } from '@/hooks/use-biz-connector-anchor';

import { type ConnectorGroup } from '../utils/format-connector-groups';
import { usePublishContainer } from '../../context/publish-container-context';
import { type ConnectorRefMap } from './use-connector-scroll';

export const useAutoScrollToConnector = ({
  connectorGroupList,
  connectorRefMap,
}: {
  connectorRefMap: ConnectorRefMap;
  connectorGroupList: ConnectorGroup[];
}) => {
  const { getAnchor, removeAnchor } = useBizConnectorAnchor();
  const { getContainerRef } = usePublishContainer();

  useEffect(() => {
    const anchor = getAnchor();

    if (!anchor) {
      return;
    }

    const targetGroup = connectorGroupList.find(group =>
      group.connectors.some(
        connector => connector.id === anchor.connectorIdBeforeRedirect,
      ),
    );

    if (!targetGroup) {
      return;
    }

    const connectorRef = connectorRefMap[targetGroup.type];
    const { updateSelectedConnectorIds } = useProjectPublishStore.getState();
    updateSelectedConnectorIds(prev => {
      if (prev.some(id => id === anchor.connectorIdBeforeRedirect)) {
        return prev;
      }
      return prev.concat(anchor.connectorIdBeforeRedirect);
    });
    getContainerRef()?.current?.scrollTo({
      top: connectorRef.current?.offsetTop,
      behavior: 'smooth',
    });

    removeAnchor();
  }, [connectorGroupList, connectorRefMap]);
};
