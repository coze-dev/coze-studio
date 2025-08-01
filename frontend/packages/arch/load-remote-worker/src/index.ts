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
      // Adapt worker calls to underlying libraries such as @byted/uploader
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

// TODO: This implementation is very dirty, and it is easy to cause accidents by tampering with the global instance, but for backward compatibility in the short term, it is temporarily reserved. Later needs:
// 1. Switch worker calls in business code to RemoteWebWorker calls
// 2. The package itself needs to add ut.
// 3. Add the lint rule, do not allow direct calls to the Worker, and use the RemoteWebWorker version uniformly
/**
 * @deprecated Do not use this function!!!
 */
export const register = (global: typeof globalThis) => {
  if (typeof global !== 'undefined') {
    global.Worker = RemoteWebWorker;
  }
};
