import { ThemeFactory, type COZTheme } from '../../factory';
import { WidgetNoResultDark } from './WidgetNoResultDark';
import { WidgetNoResult } from './WidgetNoResult';
export function WidgetSearchNoCard({ theme }: COZTheme) {
  return (
    <ThemeFactory
      theme={theme}
      components={{
        dark: <WidgetNoResultDark />,
        light: <WidgetNoResult />,
      }}
    />
  );
}
