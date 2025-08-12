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

import path from 'path';

import { type ApiConfig } from './types';

let hasShowHint = false;

function requiredWithoutCache(src, onError?) {
  let data;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Module } = require('module');
  try {
    // Disable the required cache so that you can change the mock data without restarting the service.
    const originCache = Module._cache;
    Module._cache = {};
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-require-imports
    data = require(src);
    Module._cache = originCache;
  } catch (error) {
    console.error(error);
    if (onError) {
      onError(error);
    } else {
      console.error(error);
    }
  }
  return data;
}

export function createProxy({
  root,
  handleResponseData,
}: {
  root: string;
  handleResponseData?: (service: string, method: string, data: any) => any;
}) {
  // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-require-imports
  const apiConfig = require(path.resolve(root, 'api.config.js')) as ApiConfig[];
  // eslint-disable-next-line max-params
  return async function proxyResWithMock(_, __, req, resp) {
    if (!req.headers['x-svc-method']) {
      return Promise.resolve();
    }
    const config = requiredWithoutCache(
      path.resolve(root, './api.dev.local.js'),
      () => {
        if (!hasShowHint) {
          console.warn(
            'can not find mock config, please run "gen-api" command if you want to mock',
          );
          hasShowHint = true;
        }
      },
    );
    if (
      config &&
      config.mock.includes(req.headers['x-svc-method'].split('_').join('.'))
    ) {
      const [svc, method] = req.headers['x-svc-method'].split('_');
      const target = apiConfig.find(i => i.entries[svc].length > 0);
      if (!target) {
        return Promise.resolve();
      }
      const src = path.resolve(
        root,
        target.output,
        target.entries[svc].replace(/\.(thrift|proto)$/, '.mock.js'),
      );
      const data = requiredWithoutCache(src);
      if (data) {
        try {
          if (resp) {
            resp.statusCode = 200;
            resp.setHeader('Content-Type', 'application/json');
          } else {
            console.warn('resp is not defined');
          }
          const res = await data[svc][method].res(req);
          if (handleResponseData) {
            return await handleResponseData(svc, method, res);
          }
          return res;
        } catch (error) {
          return error;
        }
      }
    }
    return Promise.resolve();
  };
}
