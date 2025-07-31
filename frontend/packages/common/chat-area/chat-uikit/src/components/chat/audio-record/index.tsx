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

import { forwardRef, useEffect, useRef, useState } from 'react';

import { useThrottleFn } from 'ahooks';
import { type AudioRecordProps, Layout } from '@coze-common/chat-uikit-shared';

import { type AudioWaveProps } from './audio-wave/type';
import { AudioWave } from './audio-wave';

export const AudioRecord = forwardRef<
  HTMLDivElement,
  AudioRecordProps & { layout: Layout }
>(({ isRecording, getVolume, isPointerMoveOut, layout, text }, ref) => {
  const [volumeNumber, setVolumeNumber] = useState(0);
  const animationIdRef = useRef<number | null>(null);
  const { run, flush } = useThrottleFn(
    () => {
      setVolumeNumber(getVolume?.() ?? 0);
      animationIdRef.current = requestAnimationFrame(run);
    },
    { wait: 100 },
  );

  const getAudioWaveTheme = (): AudioWaveProps['type'] => {
    if (layout === Layout.MOBILE) {
      return 'default';
    }
    if (isPointerMoveOut) {
      return 'warning';
    }
    return 'primary';
  };

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    run();

    return () => {
      flush();
      if (typeof animationIdRef.current !== 'number') {
        return;
      }
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    };
  }, [isRecording]);

  return (
    <div ref={ref} className="w-full h-32px relative">
      <div className="w-full h-full flex items-center justify-center pointer-events-none">
        {isRecording ? (
          <AudioWave
            size="medium"
            type={getAudioWaveTheme()}
            volumeNumber={volumeNumber}
          />
        ) : (
          <div className="coz-fg-primary text-lg font-medium leading-[20px]">
            {text}
          </div>
        )}
      </div>
    </div>
  );
});

export { AudioWave };
