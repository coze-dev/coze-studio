import * as React from 'react';

import { injectable, type interfaces, unmanaged } from 'inversify';
import { Emitter } from '@flowgram-adapter/common';
import { type URI } from '@coze-project-ide/core';

import { type Widget } from '../lumino/widgets';
import { BaseWidget } from './base-widget';

export const ReactWidgetContext = React.createContext<ReactWidget | undefined>(
  undefined,
);

@injectable()
export abstract class ReactWidget extends BaseWidget {
  /**
   * widget resource uri
   */
  uri?: URI;

  /**
   * 容器 widget
   * 该属性只会在子面板内存在。方便通过父容器访问属性。
   */
  wrapperWidget?: ReactWidget;

  onWidgetResizeEmitter = new Emitter<Widget.ResizeMessage>();

  onWidgetResize = this.onWidgetResizeEmitter.event;

  constructor(@unmanaged() options?: Widget.IOptions) {
    super(options);
    this.scrollOptions = {
      suppressScrollX: true,
      minScrollbarLength: 35,
    };
  }

  /**
   * Return an underlying resource URI.
   */
  getResourceURI(): URI | undefined {
    return this.uri?.withoutQuery();
  }

  /**
   * Creates a new URI to which this navigatable should moved based on the given target resource URI.
   */
  onOpenRequest?(resourceURI: URI, options?: any): void;

  protected onResize(msg: Widget.ResizeMessage): void {
    super.onResize(msg);
    this.onWidgetResizeEmitter.fire(msg);
  }

  /**
   *
   * @param uri 初始化的 uri
   * @param childContainer view props 传入 widget 属性的时候才会有 childContainer
   */
  init(uri: URI, childContainer?: interfaces.Container): void {
    this.uri = uri;
  }

  abstract render(): React.ReactElement<any, any> | null;
}
