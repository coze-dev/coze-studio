import { useEffect, type RefObject } from 'react';

import { type WorkflowPlaygroundRef } from '@coze-workflow/playground';
import {
  useIDEParams,
  useIDENavigate,
  useCurrentWidget,
  getURLByURI,
  type ProjectIDEWidget,
} from '@coze-project-ide/framework';

export const useRefresh = (ref: RefObject<WorkflowPlaygroundRef>) => {
  const widget = useCurrentWidget<ProjectIDEWidget>();
  const params = useIDEParams();
  const navigate = useIDENavigate();

  useEffect(() => {
    if (params.refresh) {
      ref.current?.reload();
      navigate(getURLByURI(widget.uri!.removeQueryObject('refresh')), {
        replace: true,
      });
    }
  }, [params.refresh, ref, widget, navigate]);
};
