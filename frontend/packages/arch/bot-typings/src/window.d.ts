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

declare type MicroComponentsMapItem = {
  version: string;
  cdnUrl: string;
};

interface Window {
  /**
   * IDE plugin iframe mount method for unmounting
   */
  editorDispose?: any;
  MonacoEnvironment?: any;
  tt?: {
    miniProgram: {
      postMessage: (param: {
        data?: any;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      redirectTo: (param: {
        url?: string;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      navigateTo: (param: {
        url?: string;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      reLaunch: (param: {
        url?: string;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      navigateBack: (param?: {
        delta?: number;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      getEnv: (res) => void;
    };
  };
  __cozeapp__?: {
    props: Record<string, unknown>;
    setLoading?: (loading: boolean) => void;
  };
}

declare namespace process {
  const env: {
    [key: string]: string;
  };
}
