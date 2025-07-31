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

const prefix = 'module.exports = ';

export const jsonParser = {
  _prefix: prefix,
  supportsAutofix: false,
  preprocess(text: string) {
    return [`${prefix}${text}`];
  },
  postprocess(messages /* , fileName */) {
    return messages.reduce((total, next) => {
      // disable js rules running on json files
      // this becomes too noisey, and splitting js and json
      // into separate overrides so neither inherit the other
      // is lame
      // revisit once https://github.com/eslint/rfcs/pull/9 lands
      // return total.concat(next);

      return total.concat(
        next.filter(error => error.ruleId?.startsWith('@coze-arch/')),
      );
    }, []);
  },
};
