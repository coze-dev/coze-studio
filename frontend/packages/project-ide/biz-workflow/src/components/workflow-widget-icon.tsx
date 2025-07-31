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

import { type FC, useEffect, useState, useMemo } from 'react';

import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { type WidgetContext } from '@coze-project-ide/framework';

import { WORKFLOW_SUB_TYPE_ICON_MAP } from '../constants';

interface WorkflowWidgetIconProps {
  context: WidgetContext;
}
export const WorkflowWidgetIcon: FC<WorkflowWidgetIconProps> = ({
  context,
}) => {
  const { widget } = context;
  const [iconType, setIconType] = useState<string>(
    widget.getIconType() || String(WorkflowMode.Workflow),
  );
  const icon = useMemo(() => WORKFLOW_SUB_TYPE_ICON_MAP[iconType], [iconType]);
  useEffect(() => {
    const disposable = widget.onIconTypeChanged(_iconType =>
      setIconType(_iconType),
    );
    return () => disposable?.dispose?.();
  }, []);
  return icon;
};
