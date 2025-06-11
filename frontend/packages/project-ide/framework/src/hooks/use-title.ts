import { useEffect, useState } from 'react';

import { useCurrentWidgetContext } from './use-current-widget-context';

export const useTitle = () => {
  const currentWidgetContext = useCurrentWidgetContext();
  const { widget } = currentWidgetContext;
  const [title, setTitle] = useState(widget.getTitle());
  useEffect(() => {
    const disposable = widget.onTitleChanged(_title => {
      setTitle(_title);
    });
    return () => {
      disposable?.dispose?.();
    };
  }, []);
  return title;
};
