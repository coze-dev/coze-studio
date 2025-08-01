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

import '@testing-library/jest-dom/vitest';

// Mock globals
vi.stubGlobal('AudioWorkletNode', vi.fn());
vi.stubGlobal('SAMI_WS_ORIGIN', vi.fn());
vi.stubGlobal('SAMI_APP_KEY', vi.fn());
vi.stubGlobal('IS_DEV_MODE', false);
vi.stubGlobal('IS_OVERSEA', false);

// Mock Canvas API full version
const createMockCanvas = () => ({
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4).fill(0) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4).fill(0) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    canvas: { width: 100, height: 100 },
  })),
  toDataURL: vi.fn(() => ''),
  width: 100,
  height: 100,
});

// Mock Canvas elements and API
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class MockCanvas {
    constructor() {
      Object.assign(this, createMockCanvas());
    }

    get width() {
      return 100;
    }
    get height() {
      return 100;
    }
  },
  writable: true,
});

Object.defineProperty(global, 'CanvasRenderingContext2D', {
  value: vi.fn(),
  writable: true,
});

// Mock document.createElement for canvas
const originalCreateElement = global.document?.createElement;
if (global.document) {
  global.document.createElement = vi.fn(tagName => {
    if (tagName === 'canvas') {
      return createMockCanvas();
    }
    return originalCreateElement?.call(global.document, tagName);
  });
}

// CSS file mock
vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));
vi.mock('*.less', () => ({}));
vi.mock('*.styl', () => ({}));

// Mock lottie-web full version
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn(() => ({
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
      setSpeed: vi.fn(),
      goToAndStop: vi.fn(),
      goToAndPlay: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setDirection: vi.fn(),
      playSegments: vi.fn(),
      setSubframe: vi.fn(),
      getDuration: vi.fn(() => 0),
      totalFrames: 0,
      currentFrame: 0,
      currentTime: 0,
      isLoaded: true,
    })),
    registerAnimation: vi.fn(),
    setQuality: vi.fn(),
    setLocationHref: vi.fn(),
  },
  loadAnimation: vi.fn(),
}));
