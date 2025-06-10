import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';

import { URI } from '@coze-project-ide/client';

import { addPreservedSearchParams } from '../utils';
import { URI_SCHEME, UI_BUILDER_URI } from '../constants';
import { useSpaceId } from './use-space-id';
import { useProjectIDEServices } from './use-project-ide-services';
import { useProjectId } from './use-project-id';

export const useIDENavigate = () => {
  const { view } = useProjectIDEServices();
  const spaceId = useSpaceId();
  const projectId = useProjectId();

  const navigate = useNavigate();

  /**
   * value(string): /:resourceType/:resourceId?a=a&b=b
   */
  const IDENavigate = useCallback(
    (value: string, options?: NavigateOptions) => {
      const url = `/space/${spaceId}/project-ide/${projectId}${value}`;
      const uri = new URI(`${URI_SCHEME}://${value}`);
      const isUIBuilder = uri.displayName === UI_BUILDER_URI.displayName;
      if (value && value !== '/' && !isUIBuilder) {
        // 调用 openService
        view.open(uri);
      } else {
        // 如果没有要打开的 widget，就只打开主面板
        view.openPanel(isUIBuilder ? 'ui-builder' : 'dev');
      }
      // TODO: 有了 syncURL 之后这一步有点重复考虑去掉，暂时没想到有什么 badcase
      navigate(addPreservedSearchParams(url), options);
    },
    [spaceId, projectId, view, navigate],
  );

  return IDENavigate;
};
