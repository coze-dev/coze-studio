import { type interfaces } from 'inversify';

import { ReactWidget } from '../react-widget';

export const CustomRenderWidgetFactory = Symbol('CustomRenderWidgetFactory');

export type CustomRenderWidgetFactory = (
  childContainer: interfaces.Container,
) => CustomRenderWidget;

export class CustomRenderWidget extends ReactWidget {
  render() {
    return null;
  }
}
