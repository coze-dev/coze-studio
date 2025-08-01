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

import { isFunction } from 'lodash';
import { inject, injectable, multiInject, optional } from 'inversify';
import { Emitter, isObject, type Disposable } from '@flowgram-adapter/common';
import {
  StorageService,
  WindowService,
  logger,
  URI,
} from '@coze-project-ide/core';

import { WidgetManager } from '../widget-manager';
import { type ReactWidget } from '../widget/react-widget';
import { ViewRenderer } from '../view-renderer';
import { type ViewPluginOptions } from '../types/view';
import { type Widget } from '../lumino/widgets';
import { type LayoutData } from './types';
import { ApplicationShell } from './application-shell';

/**
 * Interface for storing and restoring the internal state of widgets between sessions
 */
interface StatefulWidget {
  /**
   * The internal state of the widget, returning undefined will not save
   */
  storeState(): object | undefined;

  /**
   * Restore the stored state
   */
  restoreState(state: object): void;
}

interface PreferenceSettingEvent {
  key: string;

  value: any;
}

const CustomPreferenceContribution = Symbol('CustomPreferenceContribution');

interface CustomPreferenceContribution {
  /**
   * Registration command
   */
  registerCustomPreferences(restorer: LayoutRestorer): void;
}

export interface CustomPreferenceConfig {
  /**
   * Unique key for this configuration
   */
  key: string;
  /**
   * title
   */
  title: string;
  /**
   * describe
   */
  descprition?: string;
  /**
   * order
   */
  order: number;
  /**
   * value setter configuration
   */
  setting:
    | {
        type: 'switch';
      }
    | {
        type: 'input';
      }
    | {
        type: 'checkbox';
      }
    | {
        type: 'option';
        optionList: Array<{
          label: string;
          value: string;
        }>;
      };
  /**
   * default value
   */
  default: any;
}

namespace StatefulWidget {
  export function is(arg: unknown): arg is StatefulWidget {
    return (
      isObject<StatefulWidget>(arg) &&
      isFunction(arg.storeState) &&
      isFunction(arg.restoreState)
    );
  }
}

interface WidgetDescription {
  uriStr: string;
  innerWidgetState?: string;
}

type RestoreState = LayoutData & {
  innerState?: Record<string, any>;
};

/**
 * The entire restore process:
 *
 * -------------------- initialization --------------------
 * 1. Read the options configuration and wait for the DockPanel and SplitLayout instantiation to complete
 * 2. Read persistent data from a data source (currently localStorage), including layoutData and innerState
 * 3. Traverse the widget URIs in layoutData and recreate the widget according to the saved URI clues.
 *   3.1. Find Factory according to URI, create widget according to URI and Factory
 *   3.2. Mount with portal, which is determined by the mounting method of this ide widget
 *   3.3. Run widget.init, which is determined by ReactWidget
 *   3.4. Shell.stack (widget), all persistent widgets need to be stacked
 * 4. Sequentially restore panels and layouts
 *
 * -------------------- running --------------------
 * 5. widget disposed, save state in innerState
 * 6. When the widget is created, backfill the data from innerState
 * (Note that this is all about interacting with memory and has nothing to do with persistent data sources.)
 *
 * -------------------- destroy --------------------
 * 7. Read the layoutData before the application is destroyed, and store it in the persistent data source together with innerState
 *   7.1. A widget object in layoutData only retains its URI and is stored as a string
 *
 * Q: Why does innerState need to be stored as memory state?
 * A: The widget state that is opened and closed only exists in inner, not included by layoutData
 */

@injectable()
class LayoutRestorer {
  static storageKey = 'layout';

  @inject(ApplicationShell)
  protected readonly applicationShell: ApplicationShell;

  @inject(ViewRenderer)
  protected readonly viewRenderer: ViewRenderer;

  @inject(StorageService)
  protected readonly storageService: StorageService;

  @inject(WindowService)
  protected readonly windowService: WindowService;

  @inject(WidgetManager)
  protected readonly widgetManager: WidgetManager;

  /**
   * Maintains persistent data in memory that is read from the source during application initialization, but not used for persistent initialization
   */
  innerState: Record<string, any> = {};

  initd = new Emitter<void>();

  onDidInit = this.initd.event;

  viewOptions: ViewPluginOptions | undefined;

  storageKey = '';

  disabled = false;

  public customPreferenceConfig: CustomPreferenceConfig[] = [];

  private customPreferenceValue: Record<string, any> = {};

  private onCustomPreferenceChangeEmitter =
    new Emitter<PreferenceSettingEvent>();

  public onCustomPreferenceChange = this.onCustomPreferenceChangeEmitter.event;

  @multiInject(CustomPreferenceContribution)
  @optional()
  protected readonly contributions: CustomPreferenceContribution[] = [];

  private unloadEvent: undefined | Disposable;

  public init(options: ViewPluginOptions) {
    /** No place to put it, put it here for now */
    this.windowService.onStart();
    this.viewOptions = options;
    const { getStorageKey } = options || {};
    if (getStorageKey) {
      this.storageKey = getStorageKey();
    }
    this.disabled = this.storageService.getData(
      'layout/disabled/v2',
      !!options.restoreDisabled,
    );
    if (!this.disabled) {
      this.unloadEvent = this.windowService.onUnload(() => {
        logger.log('LayoutRestorer: unload');
        this.storeLayout();
      });
    }

    (options.customPreferenceConfigs || []).forEach(v => {
      this.customPreferenceConfig.push(v);
    });

    for (const contrib of this.contributions) {
      contrib.registerCustomPreferences(this);
    }

    this.customPreferenceConfig.forEach(config => {
      this.customPreferenceValue[config.key] = this.storageService.getData(
        config.key,
        config.default,
      );
    });

    this.initd.fire();
  }

  public setCustomPreferenceValue(key: string, value: any): void {
    this.customPreferenceValue[key] = value;
    this.storageService.setData(key, value);
    this.onCustomPreferenceChangeEmitter.fire({
      key,
      value,
    });
  }

  public getCustomPreferenceValue(key: string): any {
    return this.customPreferenceValue[key];
  }

  public registerCustomPreferenceConfig(config: CustomPreferenceConfig): void {
    this.customPreferenceConfig.push(config);
  }

  public ban(v: boolean) {
    if (v === this.disabled) {
      return;
    }
    if (!v) {
      this.unloadEvent = this.windowService.onUnload(() => {
        logger.log('LayoutRestorer: unload');
        this.storeLayout();
      });
    } else {
      this.unloadEvent?.dispose();
    }
    this.disabled = v;
    this.storageService.setData('layout/disabled/v2', v);
  }

  protected isWidgetProperty(propertyName: string): boolean {
    return propertyName === 'widget';
  }

  protected isWidgetsProperty(propertyName: string): boolean {
    return propertyName === 'widgets';
  }

  /**
   * Turns the layout data to a string representation.
   */
  protected deflate(data?: object): string | undefined {
    if (data === undefined) {
      return undefined;
    }
    return JSON.stringify(data, (property: string, value) => {
      if (this.isWidgetProperty(property)) {
        const description = this.convertToDescription(value as Widget);
        return description;
      } else if (this.isWidgetsProperty(property)) {
        const descriptions = [];
        for (const widget of value as Widget[]) {
          const description = this.convertToDescription(widget);
          if (description) {
            // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore
            descriptions.push(description);
          }
        }
        return descriptions;
      } else if (property === 'currentUri' && value) {
        return (value as URI).toString();
      }
      return value;
    });
  }

  protected async inflate(layoutData?: string): Promise<RestoreState> {
    if (layoutData === undefined) {
      return {};
    }
    const parseContext = new ShellLayoutRestorer.ParseContext();
    const layout = this.parse<RestoreState>(layoutData, parseContext);
    await parseContext.inflate();
    return layout;
  }

  protected parse<T>(
    layoutData: string,
    parseContext: ShellLayoutRestorer.ParseContext,
  ): T {
    return JSON.parse(layoutData, (property: string, value) => {
      if (this.isWidgetsProperty(property)) {
        const widgets = parseContext.filteredArray();
        const descs = value;
        for (let i = 0; i < descs.length; i++) {
          parseContext.push(async () => {
            widgets[i] = await this.convertToWidget(descs[i]);
          });
        }
        return widgets;
      } else if (isObject(value) && !Array.isArray(value)) {
        const copy: Record<string, unknown> = {};
        for (const p in value) {
          if (this.isWidgetProperty(p)) {
            parseContext.push(async () => {
              copy[p] = await this.convertToWidget(value[p] as any);
            });
          } else {
            copy[p] = value[p];
          }
        }
        return copy;
      } else if (property === 'currentUri' && value) {
        return new URI(value);
      }
      return value;
    });
  }

  protected async convertToWidget(
    desc: WidgetDescription,
  ): Promise<Widget | undefined> {
    if (!desc.uriStr) {
      return undefined;
    }
    const uri = new URI(desc.uriStr);
    const factory = this.widgetManager.getFactoryFromURI(uri);
    const widget = await this.widgetManager.getOrCreateWidgetFromURI(
      uri,
      factory,
    );
    this.viewRenderer.addReactPortal(widget);
    this.applicationShell.track(widget);

    if (StatefulWidget.is(widget) && desc.innerWidgetState !== undefined) {
      let oldState: object;
      if (typeof desc.innerWidgetState === 'string') {
        const parseContext = new ShellLayoutRestorer.ParseContext();
        oldState = this.parse(desc.innerWidgetState, parseContext);
        await parseContext.inflate();
      } else {
        oldState = desc.innerWidgetState;
      }
      widget.restoreState(oldState);
    }
    if (widget.isDisposed) {
      return undefined;
    }
    return widget;
  }

  private convertToDescription(widget: Widget): WidgetDescription | undefined {
    if (!(widget as ReactWidget).uri) {
      return;
    }
    return {
      uriStr: (widget as ReactWidget)?.uri?.toString() || '',
      innerWidgetState: StatefulWidget.is(widget)
        ? this.deflate(widget.storeState())
        : undefined,
    };
  }

  /**
   * persistent layout data
   */
  storeLayout() {
    if (this.disabled) {
      return;
    }
    const data = this.applicationShell.getLayoutData();
    const serializedData = this.deflate({
      ...data,
      innerState: this.innerState,
    });
    logger.log('layout restorer data: ', serializedData);
    this.storageService.setData(
      LayoutRestorer.storageKey + this.storageKey,
      serializedData,
    );
  }

  /**
   * Retrieve layout data
   */
  async restoreLayout() {
    if (this.disabled) {
      return;
    }
    const serializedData = this.storageService.getData<string>(
      LayoutRestorer.storageKey + this.storageKey,
    );
    const { innerState, ...layoutData } = await this.inflate(serializedData);
    logger.log('layout restorer layout data:', layoutData);
    logger.log('layout restorer inner data:', innerState);
    if (innerState !== undefined && isObject(innerState)) {
      this.innerState = innerState;
    }
    this.applicationShell.setLayoutData(layoutData);
  }

  storeWidget(widget: ReactWidget) {
    if (StatefulWidget.is(widget) && widget.uri) {
      const state = widget.storeState();
      this.innerState[widget.uri.toString()] = state;
    }
  }

  restoreWidget(widget: ReactWidget) {
    if (StatefulWidget.is(widget) && widget.uri) {
      const key = widget.uri.toString();
      const state = this.innerState[key];
      if (state !== undefined) {
        widget.restoreState(state);
      }
    }
  }
}

export namespace ShellLayoutRestorer {
  export class ParseContext {
    protected readonly toInflate: Inflate[] = [];

    protected readonly toFilter: Widgets[] = [];

    push(toInflate: Inflate): void {
      this.toInflate.push(toInflate);
    }

    filteredArray(): Widgets {
      const array: Widgets = [];
      this.toFilter.push(array);
      return array;
    }

    async inflate(): Promise<void> {
      const pending: Promise<void>[] = [];
      while (this.toInflate.length) {
        pending.push(this.toInflate.pop()!());
      }
      await Promise.all(pending);

      if (this.toFilter.length) {
        this.toFilter.forEach(arr => {
          for (let i = 0; i < arr?.length; i++) {
            if (arr[i] === undefined) {
              arr.splice(i--, 1);
            }
          }
        });
      }
    }
  }

  export type Widgets = (Widget | undefined)[];
  export type Inflate = () => Promise<void>;
}

export { LayoutRestorer, StatefulWidget, CustomPreferenceContribution };
