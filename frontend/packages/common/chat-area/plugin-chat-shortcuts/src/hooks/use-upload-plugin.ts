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
 
import {
  getFileInfo,
  type UploadPluginConstructor,
} from '@coze-common/chat-core';
import { useGetRegisteredPlugin } from '@coze-common/chat-area';

// 延迟1.5s后开始模拟上传进度
const FAKE_PROGRESS_START_DELAY = 1500;
// fake progress 初始进度
const FAKE_PROGRESS_START = 50;
// 最大进度
const FAKE_PROGRESS_MAX = 85;
// 每次步进值
const FAKE_PROGRESS_STEP = 5;
// 循环间隔
const FAKE_PROGRESS_INTERVAL = 100;

export const useGetUploadPluginInstance = () => {
  const getRegisteredPlugin = useGetRegisteredPlugin();

  return ({
    file,
    onProgress,
    onError,
    onSuccess,
  }: {
    file: File;
    onProgress?: (percent: number) => void;
    onError?: (error: { status: number | undefined }) => void;
    onSuccess?: (url: string, width: number, height: number) => void;
  }) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const UploadPlugin: UploadPluginConstructor | null | undefined =
      getRegisteredPlugin('upload-plugin');
    if (!UploadPlugin) {
      return;
    }
    const uploader = new UploadPlugin({
      file,
      type: getFileInfo(file)?.fileType === 'image' ? 'image' : 'object',
    });
    // 如果1s内上传进度没有变化，主动触发fake progress, 500ms内从50%上升到80%，忽略后续的真实进度
    let isStartFakeProgress = false;
    let fakeProgressTimer: number | undefined;
    let fakeProgress = FAKE_PROGRESS_START;
    const fakeProgressHandler = () => {
      if (fakeProgress < FAKE_PROGRESS_MAX) {
        fakeProgress += FAKE_PROGRESS_STEP;
        onProgress?.(fakeProgress);
      }
    };

    const startFakeProgressTimer = setTimeout(() => {
      isStartFakeProgress = true;
      fakeProgressTimer = window.setInterval(
        fakeProgressHandler,
        FAKE_PROGRESS_INTERVAL,
      );
    }, FAKE_PROGRESS_START_DELAY);

    function clearFakeProgress() {
      clearTimeout(startFakeProgressTimer);
      clearInterval(fakeProgressTimer);
      fakeProgressTimer = undefined;
      fakeProgressTimer = undefined;
      isStartFakeProgress = false;
    }
    uploader.on('progress', ({ percent }) => {
      // 有假进度，忽略后续的真实进度
      if (isStartFakeProgress) {
        return;
      }
      startFakeProgressTimer && clearFakeProgress();
      onProgress?.(percent);
    });
    uploader.on('error', e => {
      onError?.({ status: e.extra.errorCode });
      clearFakeProgress();
    });

    uploader.on(
      'complete',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ({ uploadResult: { Url, Uri, ImageHeight = 0, ImageWidth = 0 } }) => {
        {
          onSuccess?.(Url || Uri || '', ImageWidth, ImageHeight);
          clearFakeProgress();
        }
      },
    );
  };
};
