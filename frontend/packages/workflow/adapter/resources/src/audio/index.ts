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
  // 是否自动播放
  autoPlay?: boolean;
  // 是否循环播放
  loop?: boolean;
  // 播放结束回调
  onEnded?: () => void;
  // 加载完成回调
  onLoad?: () => void;
}

interface IAudioPlayer {
  // 是否正在播放
  isPlaying: boolean;
  // 是否暂停
  isPaused: boolean;
  // 是否停止
  isStopped: boolean;
  // 当前播放时间
  currentTime: number;
  // 音频总时长
  duration: number;
  // 播放
  play: () => void;
  // 暂停
  pause: () => void;
  // 停止
  stop: () => void;
  // 切换播放暂停
  togglePlayPause: () => void;
  // 跳转
  seek: (time: number) => void;
}

/**
 * 音频播放器 Hook
 * @param src - 音频文件的
 * @param options - 播放器配置选项
 * @returns 音频播放器控制接口
 */
export const useAudioPlayer = (
  src: File | string | undefined | null,
  { autoPlay, loop, onEnded, onLoad }: IAudioPlayerOptions = {},
): IAudioPlayer => {
  // 播放状态管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 音频元素引用
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频元素和事件监听
  useEffect(() => {
    if (!src) {
      return;
    }

    const url = src instanceof Blob ? URL.createObjectURL(src) : src;
    // 创建音频实例
    const audio = new Audio(url);
    audioRef.current = audio;

    // 设置循环播放
    audio.loop = loop ?? false;

    // 更新当前播放时间的处理函数
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // 元数据加载完成的处理函数（获取音频时长等信息）
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      onLoad?.();

      if (autoPlay) {
        audio.play();
      }

      if (src instanceof Blob) {
        // 释放音频文件的 URL，避免内存泄漏
        URL.revokeObjectURL(url);
      }
    };

    // 播放结束的处理函数
    const handleEnded = () => {
      setIsPlaying(false);
      setIsStopped(true);
      setCurrentTime(audio.duration);
      onEnded?.();
    };

    // 添加事件监听器
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // 清理函数：组件卸载时移除事件监听并释放资源
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);

      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, autoPlay, loop, onEnded, onLoad]);

  // 播放控制函数
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      setIsStopped(false);
    }
  }, []);

  // 暂停控制函数
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  // 停止控制函数
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
    }
  }, []);

  // 切换播放/暂停状态
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // 跳转到指定时间
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // 返回音频播放器控制接口
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
