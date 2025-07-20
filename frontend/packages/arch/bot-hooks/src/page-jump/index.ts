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
 
import { isNil } from 'lodash-es';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  PAGE_SCENE_MAP,
  type PageType,
  SCENE_RESPONSE_MAP,
  type SceneType,
  type SceneParamTypeMap,
} from './config';

export { PageType, SceneType };

/**
 * 页面跳转 hook
 *
 * @example
 * const pageJump = usePageJump();
 *
 * pageJump.jump(SceneType.BOT_CREATE_WORKFLOW, { ...param })
 */
export function usePageJumpService(): {
  jump: PageJumpExecFunc;
} {
  const navigate = useNavigate();
  return {
    jump: <T extends SceneType>(sceneType: T, param?: SceneParamTypeMap<T>) => {
      // eslint-disable-next-line max-len -- eslint 注释格式限制，不得不超出 max-len
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function -- 1.内部类型难以推导，不影响外侧类型约束和推导  2.只是获取 url，不会使用第二个参数，空函数仅用于解决类型错误，不影响使用，更不影响调用侧类型约束和推导
      const { url } = SCENE_RESPONSE_MAP[sceneType](param as any, () => {});

      if (!url) {
        return console.error('page jump error: no url provided');
      }

      if (
        (param as SceneParamTypeMap<SceneType.BOT__VIEW__WORKFLOW>)?.newWindow
      ) {
        window.open(url, '_blank');
      } else {
        navigate(url, { state: { ...param, scene: sceneType } });
      }
    },
  };
}

/**
 * 获取当前页面的响应值
 *
 * 如果当前页面可能有多种场景，那么返回值将是这些场景响应值的 union，需要在业务代码中根据 `scene` 来做 type narrowing
 *
 * 当没接收到场景值 或接收到的场景值与页面不匹配时，返回 null
 *
 * 注意：即使页面刷新后也会保留该响应值，若不希望刷新后也保留，需要调用 clearScene() 方法
 *
 * @example
 * const routeResponse = usePageResponse(PageType.WORKFLOW);
 * // 此时只知道是 workflow 页面，但场景可能是 查看或创建
 * if (routeResponse.scene === SceneType.BOT_CREATE_WORKFLOW) {
 *  // 此时 routeResponse 能被推导为 BOT_CREATE_WORKFLOW 场景的响应值
 * }
 */
export function usePageJumpResponse<P extends PageType>(
  pageType: P,
): SceneResponseType<PageSceneUnion<P>> | null {
  const { jump } = usePageJumpService();
  const navigate = useNavigate();
  const location = useLocation();
  const validScenes = PAGE_SCENE_MAP[pageType];
  const param: SceneParamTypeMap<(typeof validScenes)[number]> & {
    scene: (typeof validScenes)[number];
  } = location.state;

  if (isNil(param?.scene)) {
    return null;
  }

  if (!(validScenes as SceneType[]).includes(param?.scene)) {
    // route state 传来的场景枚举值，并不存在于调用方声明的页面中
    console.error(
      "got wrong route state: this page doesn't have the scene passed by route param",
    );
    return null;
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 内部类型难以推导，不影响调用侧类型推导
    ...SCENE_RESPONSE_MAP[param.scene](param as any, jump),
    scene: param.scene,
    clearScene: (forceRerender = false) => {
      if (forceRerender) {
        // 清除 history.state 之后 rerender，useLocation 依然能取到清除前的值，应该是 react-router-dom 做了缓存
        // 搜索发现做一次 replace navigate 可解，且测试发现并不会导致组件重新挂载，只会 rerender
        navigate(location.pathname, { replace: true });
        return;
      }
      history.replaceState({}, '');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 内部类型难以推导，不影响调用侧类型推导
  } as any;
}

/**
 * usePageJumpResponse().jump 的类型
 *
 * 因为要复用，所以单独声明一下
 */
export interface PageJumpExecFunc {
  /**
   * @param sceneType 场景
   * @param param 用户输入场景后，能推导出对应的 param 类型作为约束，若该场景无参数，则可不传 param
   */
  <T extends SceneWithNoParam>(sceneType: T): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- 报错有问题，不应该合并声明
  <T extends SceneType>(sceneType: T, param: SceneParamTypeMap<T>): void;
}

/** 返回 P 页面下可能的场景 */
type PageSceneUnion<P extends PageType> = (typeof PAGE_SCENE_MAP)[P][number];
/**
 * 获取场景的响应值类型
 *
 * 利用 distributive condition 特性，将返回的类型拆分为 union
 * 以便业务中利用 discriminated union 特性通过判断 scene 来实现 type narrowing
 */
export type SceneResponseType<T extends SceneType> = T extends SceneType
  ? Omit<ReturnType<(typeof SCENE_RESPONSE_MAP)[T]>, 'url'> & {
      scene: T;
      /**
       * 清除当前页面绑定的一切跳转数据
       * @param forceRefresh 是否即时清空。
       * 默认需要刷新才能清空（由于 react-router-dom 的原因，即使 rerender 也会获取到清空前的响应值）；
       * 传 true 时会调用一次 replace navigate，触发 rerender 并且不会再获取到响应值（不会触发组件 unmount）
       */
      clearScene: (forceRefresh?: boolean) => void;
    }
  : never;
/** 筛选出没有参数的场景 */
type SceneWithNoParam = SceneType extends infer P
  ? P extends SceneType
    ? SceneParamTypeMap<P> extends undefined
      ? P
      : never
    : never
  : never;
