import { createPortal } from 'react-dom';
import { type CSSProperties } from 'react';

import { useNodeRenderData } from '../../hooks';

/**
 * 自定义端口组件， 支持展开/收起；
 * 节点收起时 端口 dom 代理到 node-render这一层，避免被display:none影响。
 */
export const CustomPort = ({
  portId,
  portType,
  className,
  style,
  collapsedClassName,
  collapsedStyle,
  testId,
}: {
  portId: string;
  portType: 'input' | 'output';
  className?: string;
  style?: CSSProperties;
  collapsedClassName?: string;
  collapsedStyle?: CSSProperties;
  testId?: string;
}) => {
  const { expanded, node: nodeElement } = useNodeRenderData();

  if (expanded) {
    return (
      <div
        className={className}
        data-port-id={portId}
        data-port-type={portType}
        data-testid={testId}
        style={style}
      />
    );
  }

  return createPortal(
    <div
      data-port-id={portId}
      data-port-type={portType}
      data-testid={testId}
      className={`${collapsedClassName} absolute top-[50%] ${
        portType === 'output' ? 'right-0' : 'left-0'
      }`}
      style={collapsedStyle}
    />,
    nodeElement,
  );
};
