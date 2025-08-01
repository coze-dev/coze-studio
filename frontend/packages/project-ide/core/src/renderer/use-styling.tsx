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

import { useEffect } from 'react';

import {
  StylingService,
  type Collector,
  type ColorTheme,
  ColorService,
} from '../styles';
import { useTheme } from './use-theme';
import { useIDEService } from './use-ide-service';

type Register = (
  collector: Pick<Collector, 'prefix'>,
  theme: ColorTheme,
) => string;

const useStyling = (
  id: string,
  fn: Register,
  deps: React.DependencyList = [],
) => {
  const stylingService = useIDEService<StylingService>(StylingService);
  const colorService = useIDEService<ColorService>(ColorService);

  const { theme } = useTheme();

  useEffect(() => {
    const css = fn(
      {
        prefix: 'flowide',
      },
      {
        type: theme.type,
        label: theme.label,
        getColor: _id => colorService.getThemeColor(_id, theme.type),
      },
    );
    const dispose = stylingService.register(id, css);
    return () => dispose.dispose();
  }, [id, theme, ...deps]);
};

export { useStyling };
