import type React from 'react';
import { useEffect, useState, startTransition, useRef } from 'react';

import { type FloatLayoutPanel } from '../../services/workflow-float-layout-service';

interface FloatPanelProps {
  panel: FloatLayoutPanel;
}

export const FloatPanel: React.FC<FloatPanelProps> = ({ panel }) => {
  const nodeRef = useRef(panel.render());
  const [, setVersion] = useState(0);

  useEffect(() => {
    const dispose = panel.onUpdate(next => {
      /**
       * 点击空白区域关闭 SideSheet 的场景下
       *
       * 问题：
       * - 直接关闭 SideSheet 会导致抽屉内表单的 Blur 事件没有触发，UI 就先销毁了
       *
       * 解决思路：
       * - UI 更新的优先级需要低于抽屉内表单 Blur 相关的数据更新
       *
       * 具体方案：
       * - 使用 startTransition 将这次 UI 销毁的优先级降低执行，让 Blur 相关的数据更新可以先于抽屉的 UI 销毁前执行
       */
      startTransition(() => {
        nodeRef.current = next;
        setVersion(v => v + 1);
      });
    });
    return () => dispose.dispose();
  }, [panel]);

  return <>{nodeRef.current}</>;
};
