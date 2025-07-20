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
/** 经验值 */
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
   * 需要 3 个条件同时满足
   * 1. 随着页面滚动到不同锚点，tab 栏激活对应区域的按钮
   * 2. 点击 tab 栏 对应按钮激活 直接滚动到页面对应区域
   * 3. 当页面高度不足滚动时，点击 tab 栏也要激活对应按钮
   *
   * 由于滚动是 smooth 效果 条件 2 与 3 会发生冲突 当用户点击 tab 栏滚动时需要进行 lock
   * lock 时 条件 1 不触发
   * 需要给条件 3 一个兜底的解锁机制
   */
  const manualScrollLockRef = useRef(false);

  const manualScrollLock = () => {
    manualScrollLockRef.current = true;
  };

  const manualScrollUnLock = () => {
    manualScrollLockRef.current = false;
  };

  /** 停止滚动 LOCK_TIME 后解锁 */
  const manualScrollUnLockDebounce = useDebounceFn(manualScrollUnLock, {
    wait: LOCK_TIME,
  });

  /** 兜底解锁机制 如果用户点击 tab 栏但没有解锁 LOCK_TIME 后也应该解锁 */
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
      // 页面发生了滚动则不需要兜底机制
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
