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
