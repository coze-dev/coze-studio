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

import { inject, injectable, type interfaces, named } from 'inversify';
import {
  type AsClass,
  ContributionProvider,
  type MaybePromise,
} from '@flowgram-adapter/common';
import { ContainerFactory, type URI } from '@coze-project-ide/core';

import { WidgetFactory } from './widget/widget-factory';
import { CustomRenderWidgetFactory } from './widget/react-widgets/custom-render-widget-factory';
import { type ReactWidget } from './widget/react-widget';
import { type Widget } from './lumino/widgets';
// import { ViewRendererRegistry } from './view-render-registry';

export interface FlowWidget extends Widget {
  init?: (opt?: any) => void;
}

@injectable()
export class WidgetManager {
  protected readonly widgets = new Map<string, Widget>();

  protected widgetFactories: WidgetFactory[] = [];

  @inject(CustomRenderWidgetFactory)
  protected customRenderWidgetFactory: CustomRenderWidgetFactory;

  @inject(ContributionProvider)
  @named(WidgetFactory)
  protected readonly factoryProvider: ContributionProvider<WidgetFactory>;

  @inject(ContainerFactory) containerFactory: ContainerFactory;

  init(widgetFactories?: WidgetFactory[]) {
    this.widgetFactories = widgetFactories || [];
    for (const factory of this.factoryProvider.getContributions()) {
      this.widgetFactories.push(factory);
    }
  }

  getFactoryFromURI(uri: URI): WidgetFactory | undefined {
    for (const factory of this.widgetFactories) {
      if (factory.match && factory.match.test(uri.toString())) {
        return factory;
      }
      if (factory.canHandle && factory.canHandle(uri)) {
        return factory;
      }
    }
  }

  // @inject(ViewRendererRegistry) readonly rendererRegistry: ViewRendererRegistry;

  protected readonly pendingWidgetPromises = new Map<
    string,
    MaybePromise<Widget>
  >();

  getWidget(id: string): Widget | undefined {
    for (const [key, widget] of this.widgets.entries()) {
      if (id === key) {
        return widget;
      }
    }
    return undefined;
  }

  getWidgetFromURI(uri: URI, factory?: WidgetFactory): Widget | undefined {
    const id = this.uriToWidgetID(uri, factory);
    return this.getWidget(id);
  }

  uriToWidgetID(uri: URI, factory?: WidgetFactory): string {
    factory = factory || this.getFactoryFromURI(uri);
    return factory?.getId?.(uri) || uri.withoutQuery().toString();
  }

  getAllWidgets(): Widget[] {
    const result: Widget[] = [];
    for (const [_, widget] of this.widgets.entries()) {
      result.push(widget);
    }
    return result;
  }

  setWidget(id: string, widget: ReactWidget | Widget) {
    this.widgets.set(id, widget);
    widget.disposed.connect(() => this.widgets.delete(id));
  }

  protected doGetWidget<T extends Widget>(
    id: string,
  ): MaybePromise<T> | undefined {
    const pendingWidget =
      this.widgets.get(id) ?? this.pendingWidgetPromises.get(id);
    if (pendingWidget) {
      return pendingWidget as MaybePromise<T>;
    }
    return undefined;
  }

  async createSubWidget<T extends ReactWidget>(
    uri: URI,
    widget: AsClass<ReactWidget>,
  ): Promise<T> {
    const widgetId = this.uriToWidgetID(uri);
    const currentWidget = this.getWidget(widgetId);
    if (currentWidget) {
      return currentWidget as T;
    }
    const childContainer = this.containerFactory.createChild();
    childContainer.bind(widget).toSelf().inSingletonScope();
    const createWidget = childContainer.get<ReactWidget>(widget);
    createWidget.id = widgetId;
    createWidget.init(uri, childContainer);
    this.setWidget(widgetId, createWidget);
    return createWidget as T;
  }

  /**
   * Register with factory mode
   */
  async getOrCreateWidgetFromURI<T extends ReactWidget>(
    uri: URI,
    factory?: WidgetFactory,
  ): Promise<T> {
    factory = factory || this.getFactoryFromURI(uri);
    if (!factory) {
      throw Error(`No widget factory '${uri.toString()}' has been registered.`);
    }
    const widgetId = this.uriToWidgetID(uri, factory);
    const existingWidget = this.doGetWidget<T>(widgetId);
    if (existingWidget) {
      return existingWidget;
    }
    try {
      let widgetPromise = factory.createWidget?.(uri);
      let childContainer: interfaces.Container | undefined;
      if (!widgetPromise && factory.widget) {
        childContainer = this.containerFactory.createChild();
        childContainer.bind(factory.widget).toSelf().inSingletonScope();
        widgetPromise = childContainer.get<ReactWidget>(factory.widget);
      }
      if (!widgetPromise && factory.render) {
        childContainer = this.containerFactory.createChild();
        widgetPromise = this.customRenderWidgetFactory(childContainer);
      }
      if (!widgetPromise) {
        throw Error('No widget createWidget');
      }
      this.pendingWidgetPromises.set(widgetId, widgetPromise);
      const widget = await widgetPromise;
      if (factory.render) {
        widget.render = factory.render;
      }
      widget.id = widgetId;
      widget.init(uri, childContainer);
      this.setWidget(widgetId, widget);
      return widget as T;
    } finally {
      this.pendingWidgetPromises.delete(widgetId);
    }
  }
}
