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
