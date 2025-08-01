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

export function SocialNoResult(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="576"
      height="288"
      viewBox="0 0 576 288"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="208" y="88" width="160" height="200" rx="8" fill="white" />
      <rect
        x="208.5"
        y="88.5"
        width="159"
        height="199"
        rx="7.5"
        stroke="url(#paint0_linear_6466_153347)"
        strokeOpacity="0.24"
      />
      <g filter="url(#filter0_d_6466_153347)">
        <path
          d="M248 116.8C248 112.32 248 110.079 248.872 108.368C249.639 106.863 250.863 105.639 252.368 104.872C254.079 104 256.32 104 260.8 104H315.2C319.68 104 321.921 104 323.632 104.872C325.137 105.639 326.361 106.863 327.128 108.368C328 110.079 328 112.32 328 116.8V187.2C328 191.68 328 193.921 327.128 195.632C326.361 197.137 325.137 198.361 323.632 199.128C321.921 200 319.68 200 315.2 200H260.8C256.32 200 254.079 200 252.368 199.128C250.863 198.361 249.639 197.137 248.872 195.632C248 193.921 248 191.68 248 187.2V116.8Z"
          fill="url(#paint1_linear_6466_153347)"
        />
        <path
          d="M315.2 199.9H260.8C258.558 199.9 256.883 199.9 255.554 199.791C254.226 199.683 253.253 199.467 252.413 199.039C250.927 198.282 249.718 197.073 248.961 195.587C248.533 194.747 248.317 193.774 248.209 192.446C248.1 191.117 248.1 189.442 248.1 187.2V116.8C248.1 114.558 248.1 112.883 248.209 111.554C248.317 110.226 248.533 109.253 248.961 108.413C249.718 106.927 250.927 105.718 252.413 104.961C253.253 104.533 254.226 104.317 255.554 104.209C256.883 104.1 258.558 104.1 260.8 104.1H315.2C317.442 104.1 319.117 104.1 320.446 104.209C321.774 104.317 322.747 104.533 323.587 104.961C325.073 105.718 326.282 106.927 327.039 108.413C327.467 109.253 327.683 110.226 327.791 111.554C327.9 112.883 327.9 114.558 327.9 116.8V187.2C327.9 189.442 327.9 191.117 327.791 192.446C327.683 193.774 327.467 194.747 327.039 195.587C326.282 197.073 325.073 198.282 323.587 199.039C322.747 199.467 321.774 199.683 320.446 199.791C319.117 199.9 317.442 199.9 315.2 199.9Z"
          stroke="black"
          strokeOpacity="0.08"
          strokeWidth="0.2"
        />
      </g>
      <rect
        opacity="0.12"
        x="244"
        y="226"
        width="88"
        height="14"
        rx="7"
        fill="#2B3245"
      />
      <rect
        opacity="0.12"
        x="224"
        y="248"
        width="128"
        height="14"
        rx="7"
        fill="#2B3245"
      />
      <defs>
        <filter
          id="filter0_d_6466_153347"
          x="239.429"
          y="98.2857"
          width="97.1429"
          height="113.143"
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
            result="effect1_dropShadow_6466_153347"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_6466_153347"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_6466_153347"
          x1="288"
          y1="88"
          x2="288"
          y2="288"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38415A" />
          <stop offset="1" stopColor="#2B3245" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_6466_153347"
          x1="288"
          y1="104"
          x2="288"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F45D68" />
          <stop offset="0.0001" stopColor="#5CBCB0" />
          <stop offset="1" stopColor="#FAC818" />
        </linearGradient>
      </defs>
    </svg>
  );
}
