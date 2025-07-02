/* eslint-disable @typescript-eslint/method-signature-style */
import { type MaybePromise } from '@flowgram-adapter/common';

export const LifecycleContribution = Symbol('LifecycleContribution');
/**
 * IDE 全局生命周期注册
 */
export interface LifecycleContribution {
  /**
   * IDE 注册阶段
   */
  onInit?(): void;
  /**
   * IDE loading 阶段, 一般用于加载全局配置，如 i18n 数据
   */
  onLoading?(): MaybePromise<void>;
  /**
   * IDE 布局初始化阶段，在 onLoading 之后执行
   */
  onLayoutInit?(): MaybePromise<void>;
  /**
   * IDE 开始执行, 可以加载业务逻辑
   */
  onStart?(): MaybePromise<void>;
  /**
   * 在浏览器 `beforeunload` 之前执行，如果返回true，则会阻止
   */
  onWillDispose?(): boolean | void;
  /**
   * IDE 销毁
   */
  onDispose?(): void;
}
