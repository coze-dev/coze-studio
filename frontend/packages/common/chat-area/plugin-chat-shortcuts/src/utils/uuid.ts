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
 
// 对齐 card-builder 生成 ID 的逻辑，暂时拷贝一份，未来计划直接使用 card-buidler 的底层能力
import { nanoid, customAlphabet } from 'nanoid';

/**
 * @param prefix - id前缀
 * @param options - alphabet: 字母表; length: 长度，默认10;
 */
export const shortid = (
  prefix = '',
  options?: {
    alphabet?: string;
    length?: number;
  },
) => {
  const {
    alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    length = 10,
  } = options || {};
  const genId = customAlphabet(alphabet, length);
  return `${prefix}${genId()}`;
};

export const uuid = () => nanoid();

export const id = shortid;

export const generate = shortid;
