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

import JSONBig from 'json-bigint';
import dayjs from 'dayjs';

const jsonBig = JSONBig({ storeAsString: true });
export const textWithFallback = (text?: string | number) =>
  text && text !== '' ? text.toString() : '-';

export const formatTime = (timestamp?: number | string) =>
  dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss.SSS');

export const isJsonString = (str: string) => {
  try {
    const jsonData = JSON.parse(str);
    if (
      Object.prototype.toString.call(jsonData) !== '[object Object]' &&
      Object.prototype.toString.call(jsonData) !== '[object Array]'
    ) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
};

export const jsonParseWithBigNumber = (jsonString: string) =>
  JSON.parse(JSON.stringify(jsonBig.parse(jsonString)));

export const jsonParse = (
  jsonString: string,
): Record<string, unknown> | string => {
  if (isJsonString(jsonString)) {
    return jsonParseWithBigNumber(jsonString);
  } else {
    return jsonString;
  }
};
