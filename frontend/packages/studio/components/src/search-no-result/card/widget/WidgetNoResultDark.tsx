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

import React from 'react';
export function WidgetNoResultDark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="280"
      height="184"
      viewBox="0 0 280 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect y="148" width="280" height="14" rx="7" fill="#1C2333" />
      <rect y="170" width="192" height="14" rx="7" fill="#1C2333" />
      <rect x="200" y="170" width="80" height="14" rx="7" fill="#1C2333" />
      <rect x="0.5" y="0.5" width="279" height="135" rx="7.5" fill="#1C2333" />
      <rect
        x="0.5"
        y="0.5"
        width="279"
        height="135"
        rx="7.5"
        stroke="url(#paint0_linear_116_6085)"
      />
      <g filter="url(#filter0_d_116_6085)">
        <path
          d="M16 28.8C16 24.3196 16 22.0794 16.8719 20.3681C17.6389 18.8628 18.8628 17.6389 20.3681 16.8719C22.0794 16 24.3196 16 28.8 16H251.2C255.68 16 257.921 16 259.632 16.8719C261.137 17.6389 262.361 18.8628 263.128 20.3681C264 22.0794 264 24.3196 264 28.8V51.2C264 55.6804 264 57.9206 263.128 59.6319C262.361 61.1372 261.137 62.3611 259.632 63.1281C257.921 64 255.68 64 251.2 64H28.8C24.3196 64 22.0794 64 20.3681 63.1281C18.8628 62.3611 17.6389 61.1372 16.8719 59.6319C16 57.9206 16 55.6804 16 51.2V28.8Z"
          fill="url(#paint1_linear_116_6085)"
        />
        <path
          d="M16.1 28.8C16.1 26.5581 16.1001 24.8828 16.2087 23.5538C16.3171 22.2259 16.5335 21.2527 16.961 20.4135C17.7184 18.927 18.927 17.7184 20.4135 16.961C21.2527 16.5335 22.2259 16.3171 23.5538 16.2087C24.8828 16.1001 26.5581 16.1 28.8 16.1H251.2C253.442 16.1 255.117 16.1001 256.446 16.2087C257.774 16.3171 258.747 16.5335 259.587 16.961C261.073 17.7184 262.282 18.927 263.039 20.4135C263.467 21.2527 263.683 22.2259 263.791 23.5538C263.9 24.8828 263.9 26.5581 263.9 28.8V51.2C263.9 53.4419 263.9 55.1172 263.791 56.4462C263.683 57.7741 263.467 58.7473 263.039 59.5865C262.282 61.073 261.073 62.2816 259.587 63.039C258.747 63.4665 257.774 63.6828 256.446 63.7913C255.117 63.8999 253.442 63.9 251.2 63.9H28.8C26.5581 63.9 24.8828 63.8999 23.5538 63.7913C22.2259 63.6828 21.2527 63.4665 20.4135 63.039C18.927 62.2816 17.7184 61.073 16.961 59.5865C16.5335 58.7473 16.3171 57.7741 16.2087 56.4462C16.1001 55.1172 16.1 53.4419 16.1 51.2V28.8Z"
          stroke="black"
          strokeOpacity="0.08"
          strokeWidth="0.2"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_116_6085"
          x="7.42857"
          y="10.2857"
          width="265.143"
          height="65.1429"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.85714" />
          <feGaussianBlur stdDeviation="4.28571" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_116_6085"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_116_6085"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_116_6085"
          x1="140"
          y1="0"
          x2="140"
          y2="136"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38415A" />
          <stop offset="1" stopColor="#2B3245" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_116_6085"
          x1="140"
          y1="16"
          x2="140"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3D8DF3" />
          <stop offset="0.0001" stopColor="#5CBCB0" />
          <stop offset="1" stopColor="#133BFE" />
        </linearGradient>
      </defs>
    </svg>
  );
}
