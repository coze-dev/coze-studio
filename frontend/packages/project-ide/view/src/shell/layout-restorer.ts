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
 * 在会话之间存储和恢复 widget 其内部状态的接口
 */
interface StatefulWidget {
  /**
   * widget 内部的状态，返回 undefined 将不会保存
   */
  storeState(): object | undefined;

  /**
   * 复原存储的状态
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
   * 注册 command
   */
  registerCustomPreferences(restorer: LayoutRestorer): void;
}

export interface CustomPreferenceConfig {
  /**
   * 该配置唯一 key
   */
  key: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  descprition?: string;
  /**
   * 顺序
   */
  order: number;
  /**
   * 值设置器配置
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
   * 默认值
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
 * 整个 restore 的流程：
 *
 * -------------------- 初始化 --------------------
 * 1. 读取 options 配置，等待 DockPanel、SplitLayout 实例化完成
 * 2. 从数据源 (目前是 localStorage) 读取持久化数据，包含 layoutData 和 innerState
 * 3. 遍历 layoutData 中的 widget uri 根据保存的 uri 线索重新创建 widget
 *   3.1. 根据 uri 找到 Factory，根据 uri 和 Factory 创建 widget
 *   3.2. 用 portal 挂载，这是本 ide widget 的挂载方式决定的
 *   3.3. 运行 widget.init，这是 ReactWidget 决定的
 *   3.4. shell.stack(widget)，持久化的 widget 全部都需要被 stack
 * 4. 依次 restore 各个 panel 和 layout
 *
 * -------------------- 运行中 --------------------
 * 5. widget dispose 时，将 state 存于 innerState
 * 6. widget create 时，从 innerState 中取数据回填
 * (注意，这里都是和内存交互，和持久化数据源无关)
 *
 * -------------------- 销毁 --------------------
 * 7. 应用销毁前读取 layoutData，和 innerState 一起存入持久化数据源
 *   7.1. layoutData 中的 widget 对象仅保留它的 uri，并且会转化为 string 的形式存储
 *
 * Q：为什么 innerState 作为内存 state 也需要被存储？
 * A：被打开又被关闭的 widget state 只存在 inner 中，没有被 layoutData 囊括
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
   * 维护在内存中的持久化数据，在应用初始化时从源读取，但不会用于持久化初始化
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
    /** 没地方放，暂时放这里 */
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
   * 持久化布局数据
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
   * 取出布局数据
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
