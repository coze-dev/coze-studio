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

/* eslint-disable max-lines-per-function */
import { useState, useCallback, useEffect, useRef } from 'react';

interface IAudioPlayerOptions {
  // Whether to play automatically
  autoPlay?: boolean;
  // Whether to loop
  loop?: boolean;
  // end of play callback
  onEnded?: () => void;
  // load completion callback
  onLoad?: () => void;
}

interface IAudioPlayer {
  // Is it playing?
  isPlaying: boolean;
  // Whether to pause
  isPaused: boolean;
  // Whether to stop
  isStopped: boolean;
  // current playing time
  currentTime: number;
  // total audio duration
  duration: number;
  // play
  play: () => void;
  // pause
  pause: () => void;
  // Stop
  stop: () => void;
  // toggle playback pause
  togglePlayPause: () => void;
  // jump
  seek: (time: number) => void;
}

/**
 * Audio Player Hook
 * @Param src - audio files
 * @Param options - player configuration options
 * @Returns Audio Player Control Interface
 */
export const useAudioPlayer = (
  src: File | string | undefined | null,
  { autoPlay, loop, onEnded, onLoad }: IAudioPlayerOptions = {},
): IAudioPlayer => {
  // playback state management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements and event listeners
  useEffect(() => {
    if (!src) {
      return;
    }

    const url = src instanceof Blob ? URL.createObjectURL(src) : src;
    // Create audio instance
    const audio = new Audio(url);
    audioRef.current = audio;

    // Set up loop playback
    audio.loop = loop ?? false;

    // Update the handler for the current playback time
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // The processing function for the completion of metadata loading (to obtain information such as audio duration)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      onLoad?.();

      if (autoPlay) {
        audio.play();
      }

      if (src instanceof Blob) {
        // Release the URL of the audio file to avoid memory leaks
        URL.revokeObjectURL(url);
      }
    };

    // Handler function for end of playback
    const handleEnded = () => {
      setIsPlaying(false);
      setIsStopped(true);
      setCurrentTime(audio.duration);
      onEnded?.();
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Cleanup function: removes event listeners and frees resources when a component is unloaded
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);

      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, autoPlay, loop, onEnded, onLoad]);

  // playback control function
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      setIsStopped(false);
    }
  }, []);

  // pause control function
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  // Stop control function
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
    }
  }, []);

  // Switch play/pause state
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Jump to the specified time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Back to Audio Player Control Interface
  return {
    isPlaying,
    isPaused,
    isStopped,
    currentTime,
    duration,
    play,
    pause,
    stop,
    togglePlayPause,
    seek,
  };
};
