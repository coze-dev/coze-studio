import { useState, useLayoutEffect, useRef } from 'react';

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    // 定义更新尺寸的函数
    const updateSize = () => {
      setWidth(ref.current ? ref.current.offsetWidth : 0);
    };

    // 创建ResizeObserver实例并观察目标元素
    const observer = new ResizeObserver(updateSize);
    if (ref.current) {
      observer.observe(ref.current);
    }

    // 当组件加载时更新一次尺寸
    updateSize();

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  return { ref, width };
}
