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
 
/**
 * 代表OAuth2回调的access_token的用途，目前有：
 * 1.login：登陆时进行用户中台三方登陆（auth/login）
 * 2. delete_account：删除账号时获取ticket（auth/authorize）
 * 3. oauth: 发布三方平台是时获取用户授权
 */
export type OAuth2StateType = 'login' | 'delete_account' | 'oauth';

export interface OAuth2RedirectConfig {
  /**
   * 最终的OAuth2鉴权信息将作为路由参数跳转，这个参数指定目标路由地址，注意在目标路由上使用
   * useAuthLoginDataRouteFromOAuth2来提取路由参数，并转换成用户中台三方登陆服务（authLogin）的参数；
   * 默认值为当前路径名称，即不传navigatePath参数时，当前路由一定要注册useAuthLoginDataRouteFromOAuth2才有效
   */
  navigatePath?: string;
  /**
   * OAuth2回调后拿到的鉴权信息的使用场景，用于在一些路由组件中区分，不符合对应场景的不能用于消费
   */
  type: OAuth2StateType;
  /**
   * 传递给OAuth2服务器的state字段，会在回调时传回，用于恢复网页状态
   */

  extra?: {
    // @ts-expect-error -- linter-disable-autofix
    origin?: string;
    [x: string]: string; // 用于安全监测
    // @ts-expect-error -- linter-disable-autofix
    encrypt_state?: string; //加密state，bind_type 为 4时使用
  };
  scope?: string;
  optionalScope?: string;
}
