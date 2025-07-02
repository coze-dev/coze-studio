import { isWriteablePlugin } from '../../utils/is-writeable-plugin';
import {
  type OnTextContentRenderingContext,
  type OnMessageBoxRenderContext,
} from '../../types/plugin-class/render-life-cycle';
import { type LifeCycleContext } from '../../types';
import { type RenderLifeCycle } from '../../constants/plugin';
import { proxyFreeze } from '../../../utils/proxy-freeze';

type Expect<T extends true> = T;

type TestClassIncludeRenderLifeCycleKeys =
  RenderLifeCycle extends keyof SystemRenderLifeCycleService ? true : false;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars -- 检测类型使用
type _ = Expect<TestClassIncludeRenderLifeCycleKeys>;

export class SystemRenderLifeCycleService {
  private lifeCycleContext: LifeCycleContext;

  constructor(lifeCycleContext: LifeCycleContext) {
    this.lifeCycleContext = lifeCycleContext;
  }

  onTextContentRendering({ ctx }: { ctx: OnTextContentRenderingContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    const { pluginInstanceList } = usePluginStore.getState();

    let proxyFreezeContext = proxyFreeze(ctx);
    for (const plugin of pluginInstanceList) {
      if (isWriteablePlugin(plugin)) {
        const newContext =
          plugin.lifeCycleServices?.renderLifeCycleService?.onTextContentRendering?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          continue;
        }

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        plugin.lifeCycleServices?.renderLifeCycleService?.onTextContentRendering?.(
          proxyFreezeContext,
        );
      }
    }
    return proxyFreezeContext;
  }

  onMessageBoxRender({ ctx }: { ctx: OnMessageBoxRenderContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onMessageBoxRender Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      const newContext =
        plugin.lifeCycleServices?.renderLifeCycleService?.onMessageBoxRender?.(
          proxyFreezeContext,
        );

      if (!newContext) {
        continue;
      }

      proxyFreezeContext = newContext;
    }
    /**
     * CycleLife - Message - onMessageBoxRender End
     */

    return proxyFreezeContext;
  }
}
