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

import { URI, useIDEService, WidgetManager } from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '../widgets/project-ide-widget';
import { URI_SCHEME } from '../constants';

export const useGetUIWidgetFromId = (
  value: string,
): ProjectIDEWidget | undefined => {
  const widgetManager = useIDEService<WidgetManager>(WidgetManager);
  const uri = new URI(`${URI_SCHEME}://${value}`);
  const widget = widgetManager.getWidgetFromURI(uri) as ProjectIDEWidget;
  return widget;
};
