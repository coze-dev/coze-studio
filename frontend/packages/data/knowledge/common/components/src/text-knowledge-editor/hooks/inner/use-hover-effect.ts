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

import { useState } from 'react';

export const useHoverEffect = () => {
  const [hoveredChunk, setHoveredChunk] = useState<string | null>(null);

  // Handling mouse hover events
  const handleMouseEnter = (chunkId: string) => {
    setHoveredChunk(chunkId);
  };

  // Handling mouse away events
  const handleMouseLeave = () => {
    setHoveredChunk(null);
  };

  return {
    hoveredChunk,
    handleMouseEnter,
    handleMouseLeave,
  };
};
