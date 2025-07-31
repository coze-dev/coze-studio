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
 * Page redirect hook
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
      // eslint-disable-next-line max-len -- eslint comment format limit, have to exceed max-len
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function -- 1. The internal type is difficult to derive and does not affect the outer type constraint and derivation 2. Just get the url, do not use the second parameter, the empty function is only used to solve the type error, does not affect the use, and does not affect the call side type constraint and derivation
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
 * Get the response value of the current page
 *
 * If the current page may have multiple scenes, then the return value will be the union of the response values of these scenes. You need to do type narrowing according to the'scene 'in the business code.
 *
 * Returns null when no scene value is received, or if the received scene value does not match the page
 *
 * Note: The response value will be retained even after the page is refreshed. If you don't want it to be retained after the refresh, you need to call the clearScene () method
 *
 * @example
 * const routeResponse = usePageResponse(PageType.WORKFLOW);
 * //At this time, only the workflow page is known, but the scene may be, view or createw page is known, but the scene may be viewed or created
 * if (routeResponse.scene === SceneType.BOT_CREATE_WORKFLOW) {
 *  //At this point routeResponse can be derived as the response value of the BOT_CREATE_WORKFLOW scene response value of the BOT_CREATE_WORKFLOW scene
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
    // The scene enumeration value from route state does not exist in the page declared by the caller
    console.error(
      "got wrong route state: this page doesn't have the scene passed by route param",
    );
    return null;
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- internal types are difficult to derive, does not affect call-side type derivation
    ...SCENE_RESPONSE_MAP[param.scene](param as any, jump),
    scene: param.scene,
    clearScene: (forceRerender = false) => {
      if (forceRerender) {
        // After clearing history.state, rerender, useLocation can still get the value before clearing, it should be cached by react-router-dom
        // Search discovery can be solved by doing a replace navigate, and test discovery does not cause the component to be remounted, only rerendered
        navigate(location.pathname, { replace: true });
        return;
      }
      history.replaceState({}, '');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- internal types are difficult to derive, does not affect call-side type derivation
  } as any;
}

/**
 * usePageJumpResponse ().jump type
 *
 * Because it needs to be reused, it is declared separately.
 */
export interface PageJumpExecFunc {
  /**
   * @param sceneType
   * @Param param After the user enters the scene, the corresponding param type can be derived as a constraint. If the scene has no parameters, no param can be passed.
   */
  <T extends SceneWithNoParam>(sceneType: T): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- There is a problem with the error, the declaration should not be merged
  <T extends SceneType>(sceneType: T, param: SceneParamTypeMap<T>): void;
}

/** Return to the possible scenarios under the P page */
type PageSceneUnion<P extends PageType> = (typeof PAGE_SCENE_MAP)[P][number];
/**
 * Get the response value type of the scene
 *
 * Use the distributive condition property to split the returned type into union.
 * In order to use the discriminated union feature in the business to realize type narrowing by judging the scene
 */
export type SceneResponseType<T extends SceneType> = T extends SceneType
  ? Omit<ReturnType<(typeof SCENE_RESPONSE_MAP)[T]>, 'url'> & {
      scene: T;
      /**
       * Clear all jump data bound to the current page
       * @Param forceRefresh is emptied instantly.
       * By default, it needs to be refreshed to clear (due to react-router-dom, even rerender will get the response value before clearing);
       * When passing true, replace navigate will be called once, triggering rerender and no response value will be obtained (no component unmount will be triggered).
       */
      clearScene: (forceRefresh?: boolean) => void;
    }
  : never;
/** Filter out scenes without parameters */
type SceneWithNoParam = SceneType extends infer P
  ? P extends SceneType
    ? SceneParamTypeMap<P> extends undefined
      ? P
      : never
    : never
  : never;
