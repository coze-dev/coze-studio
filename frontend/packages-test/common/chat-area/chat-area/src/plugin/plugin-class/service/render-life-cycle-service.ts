import {
  type OnTextContentRenderingContext,
  type OnMessageBoxRenderContext,
} from '../../types/plugin-class/render-life-cycle';
import {
  ReadonlyLifeCycleService,
  WriteableLifeCycleService,
} from './life-cycle-service';

/**
 * ! 希望你注意到生命周期的上下文信息都放在ctx中
 * ! 如果判断只是上下文，请你注意收敛到ctx中，请勿增加新的参数
 * ! CodeReview的时候辛苦也注重一下这里
 */
export abstract class ReadonlyRenderLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  onTextContentRendering?(
    ctx: OnTextContentRenderingContext,
  ): OnTextContentRenderingContext;
  onMessageBoxRender?(
    ctx: OnMessageBoxRenderContext,
  ): OnMessageBoxRenderContext;
}

export abstract class WriteableRenderLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  onTextContentRendering?(
    ctx: OnTextContentRenderingContext,
  ): OnTextContentRenderingContext;
  onMessageBoxRender?(
    ctx: OnMessageBoxRenderContext,
  ): OnMessageBoxRenderContext;
}
