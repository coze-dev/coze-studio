import React, { useState } from 'react';

import { Tooltip } from '@coze-arch/coze-design';

import { UrlField } from './url-field';

export function UrlContainer({ apiUrl }: { apiUrl: string }) {
  const [isTipsVisible, setTipsVisible] = useState(false);
  const [isHover, setHover] = useState(false);
  const wrapperId = `http-url-tips-${Math.random()}`;
  return (
    <div
      id={wrapperId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Tooltip
        trigger="custom"
        visible={isHover && isTipsVisible}
        key="http-url-tips"
        motion={false}
        style={{
          transform: 'translateX(60%)',
          backgroundColor: 'rgba(var(--coze-bg-3), 1)',
        }}
        content={<UrlField apiUrl={apiUrl} isTooltips />}
        getPopupContainer={() =>
          (document.getElementById(wrapperId) as HTMLElement) ?? document.body
        }
      >
        <UrlField apiUrl={apiUrl} setTipsVisible={setTipsVisible} />
      </Tooltip>
    </div>
  );
}
