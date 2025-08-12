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

/* eslint-disable max-lines-per-function */
import { type RefObject, useEffect, useRef, useState } from 'react';

import { useDebounceFn } from 'ahooks';
import { ConnectorClassification } from '@coze-arch/idl/intelligence_api';

import { usePublishContainer } from '../../context/publish-container-context';

export type ConnectorRefMap = Record<
  ConnectorClassification,
  RefObject<HTMLDivElement>
>;

const useConnectorRefMap = (): ConnectorRefMap => ({
  [ConnectorClassification.APIOrSDK]: useRef<HTMLDivElement>(null),
  [ConnectorClassification.MiniProgram]: useRef<HTMLDivElement>(null),
  [ConnectorClassification.SocialPlatform]: useRef<HTMLDivElement>(null),
  [ConnectorClassification.Coze]: useRef<HTMLDivElement>(null),
  [ConnectorClassification.CozeSpaceExtensionLibrary]:
    useRef<HTMLDivElement>(null),
});

const getActiveConnectorTarget = ({
  containerScrollTop,
  connectorRefMap,
  connectorBarHeight,
  publishHeaderHeight,
}: {
  containerScrollTop: number;
  connectorBarHeight: number;
  connectorRefMap: ConnectorRefMap;
  publishHeaderHeight: number;
}) => {
  const connectorTargetLis = Object.entries(connectorRefMap)
    .map(([, ref]) => ref.current)
    .filter((element): element is HTMLDivElement => Boolean(element));

  const offsetTopList = connectorTargetLis.map(target => ({
    offsetTop:
      target.offsetTop -
      containerScrollTop -
      publishHeaderHeight -
      connectorBarHeight,
    target,
  }));

  const sortedTopList = offsetTopList.sort(
    (prev, cur) => prev.offsetTop - cur.offsetTop,
  );
  const preActiveConnectorList = sortedTopList.filter(
    item => item.offsetTop <= 0,
  );
  const activeConnector = preActiveConnectorList.length
    ? preActiveConnectorList.at(-1)
    : sortedTopList.at(0);

  return activeConnector?.target;
};
/** experience point */
const LOCK_TIME = 300;

export const useConnectorScroll = () => {
  const [activeConnectorTarget, setActiveConnectorTarget] =
    useState<HTMLDivElement>();
  const connectorBarRef = useRef<HTMLDivElement>(null);

  const { getContainerRef } = usePublishContainer();

  const connectorRefMap = useConnectorRefMap();

  const { publishHeaderHeight } = usePublishContainer();

  const [animationStateMap, setAnimationMap] = useState<
    Record<ConnectorClassification, boolean>
  >({
    [ConnectorClassification.APIOrSDK]: false,
    [ConnectorClassification.MiniProgram]: false,
    [ConnectorClassification.SocialPlatform]: false,
    [ConnectorClassification.Coze]: false,
    [ConnectorClassification.CozeSpaceExtensionLibrary]: false,
  });

  /**
   * All three conditions need to be met simultaneously
   * 1. As the page scrolls to different anchors, the tab bar activates the button for the corresponding area
   * 2. Click the tab bar, activate the corresponding button, and scroll directly to the corresponding area of the page
   * 3. When the page height is insufficient to scroll, click the tab bar to activate the corresponding button
   *
   * Since the scroll is a smooth effect, conditions 2 and 3 will conflict, and the lock needs to be performed when the user clicks the tab bar to scroll.
   * Condition 1 does not fire when locked
   * Need to give condition 3 an unlocking mechanism with a bottom line
   */
  const manualScrollLockRef = useRef(false);

  const manualScrollLock = () => {
    manualScrollLockRef.current = true;
  };

  const manualScrollUnLock = () => {
    manualScrollLockRef.current = false;
  };

  /** Unlock after LOCK_TIME */
  const manualScrollUnLockDebounce = useDebounceFn(manualScrollUnLock, {
    wait: LOCK_TIME,
  });

  /** The bottom unlocking mechanism, if the user clicks the tab bar but does not unlock the LOCK_TIME should also be unlocked */
  const baseUnLockDebounce = useDebounceFn(manualScrollUnLock, {
    wait: LOCK_TIME,
  });

  useEffect(() => {
    const containerTarget = getContainerRef()?.current;
    const connectorBarTarget = connectorBarRef.current;
    if (!containerTarget || !connectorBarTarget) {
      return;
    }
    const changeActiveConnectorTarget = () => {
      if (manualScrollLockRef.current) {
        return;
      }
      setActiveConnectorTarget(
        getActiveConnectorTarget({
          containerScrollTop: containerTarget.scrollTop,
          connectorRefMap,
          connectorBarHeight: connectorBarTarget.offsetHeight,
          publishHeaderHeight,
        }),
      );
    };

    changeActiveConnectorTarget();

    const onScroll = () => {
      // If the page scrolls, no safety net mechanism is required
      baseUnLockDebounce.cancel();
      manualScrollUnLockDebounce.run();
      changeActiveConnectorTarget();
    };

    containerTarget.addEventListener('scroll', onScroll);
    return () => {
      containerTarget.removeEventListener('scroll', onScroll);
    };
  }, [getContainerRef, connectorRefMap, publishHeaderHeight]);

  const startAnimation = (classification: ConnectorClassification) => {
    setAnimationMap(prev => ({ ...prev, [classification]: true }));
  };

  const closeAnimation = (classification: ConnectorClassification) => {
    setAnimationMap(prev => ({ ...prev, [classification]: false }));
  };

  const scrollToConnector = (classification: ConnectorClassification) => {
    const barTarget = connectorBarRef.current;
    const containerTarget = getContainerRef()?.current;
    const connectorTarget = connectorRefMap[classification].current;
    if (!barTarget || !containerTarget || !connectorTarget) {
      return;
    }

    containerTarget.scrollTo({
      behavior: 'smooth',
      top:
        connectorTarget.offsetTop -
        publishHeaderHeight -
        barTarget.offsetHeight,
    });
    startAnimation(classification);
    setActiveConnectorTarget(connectorTarget);
    manualScrollLock();
    baseUnLockDebounce.run();
  };

  return {
    connectorRefMap,
    activeConnectorTarget,
    connectorBarRef,
    scrollToConnector,
    closeAnimation,
    animationStateMap,
  };
};
