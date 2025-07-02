import { useEffect } from 'react';

import {
  StylingService,
  type Collector,
  type ColorTheme,
  ColorService,
} from '../styles';
import { useTheme } from './use-theme';
import { useIDEService } from './use-ide-service';

type Register = (
  collector: Pick<Collector, 'prefix'>,
  theme: ColorTheme,
) => string;

const useStyling = (
  id: string,
  fn: Register,
  deps: React.DependencyList = [],
) => {
  const stylingService = useIDEService<StylingService>(StylingService);
  const colorService = useIDEService<ColorService>(ColorService);

  const { theme } = useTheme();

  useEffect(() => {
    const css = fn(
      {
        prefix: 'flowide',
      },
      {
        type: theme.type,
        label: theme.label,
        getColor: _id => colorService.getThemeColor(_id, theme.type),
      },
    );
    const dispose = stylingService.register(id, css);
    return () => dispose.dispose();
  }, [id, theme, ...deps]);
};

export { useStyling };
