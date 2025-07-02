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
