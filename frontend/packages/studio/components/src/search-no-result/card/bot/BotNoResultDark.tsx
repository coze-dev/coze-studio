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

export function BotNoResultDark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="280"
      height="102"
      viewBox="0 0 280 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="279" height="101" rx="7.5" fill="#1C2333" />
      <rect
        x="0.5"
        y="0.5"
        width="279"
        height="101"
        rx="7.5"
        stroke="url(#paint0_linear_4513_103137)"
      />
      <rect x="16" y="18" width="104" height="14" rx="7" fill="#2B3245" />
      <rect x="16" y="40" width="196" height="14" rx="7" fill="#2B3245" />
      <g filter="url(#filter0_d_4513_103137)">
        <path
          d="M224 22.4C224 20.1598 224 19.0397 224.436 18.184C224.819 17.4314 225.431 16.8195 226.184 16.436C227.04 16 228.16 16 230.4 16H257.6C259.84 16 260.96 16 261.816 16.436C262.569 16.8195 263.181 17.4314 263.564 18.184C264 19.0397 264 20.1598 264 22.4V49.6C264 51.8402 264 52.9603 263.564 53.816C263.181 54.5686 262.569 55.1805 261.816 55.564C260.96 56 259.84 56 257.6 56H230.4C228.16 56 227.04 56 226.184 55.564C225.431 55.1805 224.819 54.5686 224.436 53.816C224 52.9603 224 51.8402 224 49.6V22.4Z"
          fill="url(#paint1_linear_4513_103137)"
        />
        <path
          d="M224.1 22.4C224.1 21.2782 224.1 20.4429 224.154 19.781C224.208 19.1201 224.315 18.6408 224.525 18.2294C224.899 17.4956 225.496 16.899 226.229 16.5251C226.641 16.3155 227.12 16.2082 227.781 16.1542C228.443 16.1001 229.278 16.1 230.4 16.1H257.6C258.722 16.1 259.557 16.1001 260.219 16.1542C260.88 16.2082 261.359 16.3155 261.771 16.5251C262.504 16.899 263.101 17.4956 263.475 18.2294C263.685 18.6408 263.792 19.1201 263.846 19.781C263.9 20.4429 263.9 21.2782 263.9 22.4V49.6C263.9 50.7218 263.9 51.5571 263.846 52.219C263.792 52.8799 263.685 53.3592 263.475 53.7706C263.101 54.5044 262.504 55.101 261.771 55.4749C261.359 55.6845 260.88 55.7918 260.219 55.8458C259.557 55.8999 258.722 55.9 257.6 55.9H230.4C229.278 55.9 228.443 55.8999 227.781 55.8458C227.12 55.7918 226.641 55.6845 226.229 55.4749C225.496 55.101 224.899 54.5044 224.525 53.7706C224.315 53.3592 224.208 52.8799 224.154 52.219C224.1 51.5571 224.1 50.7218 224.1 49.6V22.4Z"
          stroke="black"
          strokeOpacity="0.08"
          strokeWidth="0.2"
        />
      </g>
      <rect x="16" y="72" width="248" height="14" rx="7" fill="#2B3245" />
      <defs>
        <filter
          id="filter0_d_4513_103137"
          x="215.429"
          y="10.2857"
          width="57.1429"
          height="57.1429"
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
            result="effect1_dropShadow_4513_103137"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4513_103137"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_4513_103137"
          x1="140"
          y1="0"
          x2="140"
          y2="102"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38415A" />
          <stop offset="1" stopColor="#2B3245" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4513_103137"
          x1="244"
          y1="16"
          x2="244"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F45D68" />
          <stop offset="1" stopColor="#FFCA00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
