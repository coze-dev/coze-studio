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

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { type URI, useCurrentWidget } from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '../widgets/project-ide-widget';

type ActivateCallback = (widget: ProjectIDEWidget) => void;

interface WidgetLocation {
  uri: URI;
  pathname: string;
  params: { [key: string]: string | undefined };
}

const genLocationByURI = (uri: URI): WidgetLocation => ({
  uri,
  pathname: uri.path.toString(),
  params: uri.queryObject,
});

const useCurrentWidgetActivate = (cb: ActivateCallback) => {
  const currentWidget = useCurrentWidget() as ProjectIDEWidget;
  useLayoutEffect(() => {
    const dispose = currentWidget.onActivate(() => {
      cb(currentWidget);
    });
    return () => dispose.dispose();
  }, [currentWidget, cb]);
};

/**
 * Get the location of the current widget
 */
export const useIDELocation = () => {
  const currentWidget = useCurrentWidget() as ProjectIDEWidget;
  const [location, setLocation] = useState(
    genLocationByURI(currentWidget.uri!),
  );
  const uriRef = useRef(currentWidget.uri?.toString());

  const callback = useCallback<ActivateCallback>(
    widget => {
      if (uriRef.current !== widget.uri?.toString()) {
        uriRef.current = widget.uri?.toString();
        setLocation(genLocationByURI(widget.uri!));
      }
    },
    [setLocation, uriRef],
  );

  useCurrentWidgetActivate(callback);

  return location;
};

/**
 * Get the query parameters of the current widget
 */
export const useIDEParams = () => {
  const currentWidget = useCurrentWidget() as ProjectIDEWidget;
  const [params, setParams] = useState(currentWidget.uri?.queryObject || {});
  const queryRef = useRef(currentWidget.uri?.query);

  const callback = useCallback<ActivateCallback>(
    widget => {
      const query = widget.uri?.query;
      if (queryRef.current !== query) {
        queryRef.current = query;
        setParams(widget.uri?.queryObject || {});
      }
    },
    [queryRef, setParams],
  );

  useCurrentWidgetActivate(callback);

  return params;
};
