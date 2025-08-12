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

import { type PropsWithChildren, useRef, useState } from 'react';

import { DEFAULT_PUBLISH_HEADER_HEIGHT } from '../../../utils/constants';
import { PublishContainerContext } from '../../../context/publish-container-context';

export const PublishContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [publishHeaderHeight, setPublishHeaderHeight] = useState(
    DEFAULT_PUBLISH_HEADER_HEIGHT,
  );

  const getContainerRef = () => ref;

  return (
    <PublishContainerContext.Provider
      value={{ getContainerRef, publishHeaderHeight, setPublishHeaderHeight }}
    >
      <div
        ref={ref}
        className="flex-[1] w-full h-full overflow-x-hidden coz-bg-primary"
      >
        {children}
      </div>
    </PublishContainerContext.Provider>
  );
};
