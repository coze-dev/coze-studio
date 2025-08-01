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
