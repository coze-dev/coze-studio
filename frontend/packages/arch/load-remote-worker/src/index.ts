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
 
// Inspire by https://github.com/jantimon/remote-web-worker
// Patch Worker to allow loading scripts from remote URLs
//
// It's a workaround for the fact that the Worker constructor
// accepts only local URLs, not remote URLs:
// https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
//
// As a workaround this patched Worker constructor will
// use `importScripts` to load the remote script.
// https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
//
// Compatibility: Chrome 4+, Firefox 4+, Safari 4+

export class RemoteWebWorker extends Worker {
  constructor(scriptURL, options) {
    const url = String(scriptURL);
    const remoteWorkerUrl =
      url.includes('://') &&
      !url.startsWith(location.origin) &&
      // 适配 @byted/uploader 等底层库的worker 调用
      !url.startsWith('blob:')
        ? URL.createObjectURL(
            new Blob(
              [
                `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${url}"))))(importScripts);importScripts("${url}")`,
              ],
              {
                type: 'text/javascript',
              },
            ),
          )
        : scriptURL;

    super(remoteWorkerUrl, options);
  }
}

// TODO: 这种实现很脏，会篡改全局实例容易引发意外，但短期内为了向后兼容，暂时保留，后续需要：
// 1. 将业务代码中的 worker 调用切换为 RemoteWebWorker 调用
// 2. 这个 package 本身需要增加 ut
// 3. 增加 lint 规则，不允许直接调用 Worker，统一使用 RemoteWebWorker 版本
/**
 * @deprecated Do not use this function!!!
 */
export const register = (global: typeof globalThis) => {
  if (typeof global !== 'undefined') {
    global.Worker = RemoteWebWorker;
  }
};
