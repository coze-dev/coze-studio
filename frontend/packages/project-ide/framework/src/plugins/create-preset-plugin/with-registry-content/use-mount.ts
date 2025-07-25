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
 
/**
 * 控制组件真正的挂载时机
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from 'react';

import { isFunction } from 'lodash-es';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { type RegistryHandler } from '@/types';

export const useMount = (
  registry: RegistryHandler,
  widget: ProjectIDEWidget,
) => {
  /**
   * 是否已经挂载
   */
  const [mounted, setMounted] = useState(widget.isVisible);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(widget.isVisible);

  /**
   * 是否已加载完成
   */
  const [loaded, setLoaded] = useState(!registry.load);

  /**
   * renderContent 函数结果缓存
   * 由于 registry 和 widget 基本不变，可以保证在同一个 widget 中 renderContent 函数只会运行一次
   * 除非 WidgetComp 组件被卸载 =.=
   */
  const content = useMemo(() => {
    if (!isFunction(registry.renderContent)) {
      return null;
    }

    return registry.renderContent(widget.context, widget);
  }, [registry, widget, version]);

  /**
   * 支持 registry 定义加载函数
   */
  const load = useCallback(async () => {
    if (!registry.load || !isFunction(registry.load)) {
      return;
    }
    await registry.load(widget.context);
    setLoaded(true);
  }, [registry, widget, setLoaded]);

  /**
   * 监听 widget 的显示隐藏状态，若 widget 显示且未挂载，则需要主动挂载一次
   */
  const watchWidgetStatus = useCallback(
    (w: ProjectIDEWidget) => {
      const { isVisible } = w;
      if (isVisible && !mountedRef.current) {
        setMounted(true);
        mountedRef.current = true;
      }
      return w.onDidChangeVisibility(visible => {
        if (visible && !mountedRef.current) {
          setMounted(true);
          mountedRef.current = true;
        }
      });
    },
    [setMounted, mountedRef],
  );

  /**
   * 监听器可以较早挂载，避免多渲染一次
   */
  useLayoutEffect(() => {
    const dispose = watchWidgetStatus(widget);
    const disposeRefresh = widget.onRefresh(() => {
      setVersion(prev => prev + 1);
    });
    return () => {
      dispose.dispose();
      disposeRefresh.dispose();
    };
  }, [widget, watchWidgetStatus]);

  /**
   * 加载函数时机暂无特殊设计，先保持和历史逻辑一致
   */
  useEffect(() => {
    load();
  }, [load]);

  return {
    loaded,
    mounted,
    content,
  };
};
