import React from 'react';

import { IconCozMore } from '@coze/coze-design/icons';
import { Button, Tooltip } from '@coze/coze-design';

import { type RenderMoreSuffixType, type ResourceType } from '../../type';
import { MORE_TOOLS_CLASS_NAME } from '../../constant';

const MoreTools = ({
  resource,
  contextMenuCallback,
  resourceTreeWrapperRef,
  renderMoreSuffix,
}: {
  resource: ResourceType;
  contextMenuCallback: (e: any, resources?: ResourceType[]) => () => void;
  resourceTreeWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  renderMoreSuffix?: RenderMoreSuffixType;
}) => {
  const handleClick = e => {
    /**
     * 这里将 event 的 currentTarget 设置成树组件的 wrapper 元素，保证 contextMenu 的 matchItems 方法可以正常遍历。
     */
    e.currentTarget = resourceTreeWrapperRef.current;
    contextMenuCallback(e, [resource]);
  };

  const btnElm = (
    <Button
      {...(typeof renderMoreSuffix === 'object' && renderMoreSuffix?.extraProps
        ? renderMoreSuffix?.extraProps
        : {})}
      className={`base-item-more-hover-display-class ${MORE_TOOLS_CLASS_NAME} base-item-more-btn ${
        typeof renderMoreSuffix === 'object' && renderMoreSuffix.className
          ? renderMoreSuffix.className
          : ''
      }`}
      style={
        typeof renderMoreSuffix === 'object' && renderMoreSuffix.style
          ? renderMoreSuffix.style
          : {}
      }
      icon={<IconCozMore />}
      theme="borderless"
      size="small"
      onMouseUp={handleClick}
    />
  );

  if (typeof renderMoreSuffix === 'object' && renderMoreSuffix.render) {
    return renderMoreSuffix.render({
      onActive: handleClick,
      baseBtn: btnElm,
      resource,
    });
  }

  if (typeof renderMoreSuffix === 'object' && renderMoreSuffix.tooltip) {
    if (typeof renderMoreSuffix.tooltip === 'string') {
      return <Tooltip content={renderMoreSuffix.tooltip}>{btnElm}</Tooltip>;
    }
    return <Tooltip {...renderMoreSuffix.tooltip}>{btnElm}</Tooltip>;
  }

  return btnElm;
};

export { MoreTools };
