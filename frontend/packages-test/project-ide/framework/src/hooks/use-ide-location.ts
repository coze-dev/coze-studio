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
 * 获取当前 widget 的 location
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
 * 获取当前 widget 的 query 参数
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
