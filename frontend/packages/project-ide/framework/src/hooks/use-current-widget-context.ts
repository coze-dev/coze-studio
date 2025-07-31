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

import { useCurrentWidget } from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';

import { type WidgetContext } from '../context/widget-context';

/**
 * Get the current WidgetContext
 * Called within the registry's renderContent
 */
export function useCurrentWidgetContext<T>(): WidgetContext<T> {
  const currentWidget = useCurrentWidget() as ProjectIDEWidget;
  if (!currentWidget.context) {
    throw new Error(
      '[useWidgetContext] Undefined widgetContext from ide context',
    );
  }
  return currentWidget.context as WidgetContext<T>;
}
