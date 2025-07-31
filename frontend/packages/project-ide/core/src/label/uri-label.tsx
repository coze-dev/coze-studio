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

import React, { useEffect } from 'react';

import { URI } from '../common';
import {
  type LabelChangeEvent,
  LabelService,
  useIDEService,
  useRefresh,
} from '../';

export interface URILabelProps {
  uri: string | URI;
}

/**
 * React component for rendering Label
 * @param props
 * @constructor
 */
export const URILabel: React.FC<URILabelProps> = props => {
  const uri = typeof props.uri === 'string' ? new URI(props.uri) : props.uri;
  const labelService = useIDEService<LabelService>(LabelService);
  const refresh = useRefresh();
  useEffect(() => {
    const dispose = labelService.onChange((event: LabelChangeEvent) => {
      if (event.affects(uri)) {
        refresh();
      }
    });
    return () => dispose.dispose();
  }, []);
  return <>{labelService.renderer(uri)}</>;
};
