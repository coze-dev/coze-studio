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

export function Arrow({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: 'rotate(-90deg)',
      }}
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        fill="transparent"
        stroke={color}
        strokeWidth={1.6}
      />
      <path
        fill={color}
        d="M10.8281 9.4715C11.0883 9.21131 11.0885 8.78909 10.8291 8.52804C10.6413 8.33892 10.4536 8.14952 10.266 7.9601C9.66706 7.35551 9.06799 6.75079 8.46068 6.15496C8.20439 5.90352 7.7947 5.90352 7.53841 6.15496C6.93103 6.75085 6.33191 7.35564 5.73291 7.96029C5.5454 8.14957 5.3579 8.33884 5.17017 8.52782C4.91075 8.78895 4.91096 9.21099 5.17124 9.47127C5.43152 9.73155 5.85355 9.73176 6.11383 9.47148L7.99955 7.58576L9.88548 9.4717C10.1457 9.73189 10.5679 9.73169 10.8281 9.4715Z"
      />
      <path
        fill={color}
        d="M0.888672 7.99997C0.888672 4.07261 4.07242 0.888855 7.99978 0.888855C11.9271 0.888855 15.1109 4.07261 15.1109 7.99997C15.1109 11.9273 11.9271 15.1111 7.99978 15.1111C4.07242 15.1111 0.888672 11.9273 0.888672 7.99997ZM13.818 7.99997C13.818 4.78667 11.2131 2.18178 7.99978 2.18178C4.78649 2.18178 2.1816 4.78667 2.1816 7.99997C2.1816 11.2133 4.78649 13.8181 7.99978 13.8181C11.2131 13.8181 13.818 11.2133 13.818 7.99997Z"
      />
    </svg>
  );
}
