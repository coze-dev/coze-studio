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

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-less',
    'stylelint-config-clean-order',
  ],
  plugins: ['./plugins/plugin-disallow-nesting-level-one-global.js'],
  rules: {
    // Variable naming rules to adapt to the code style in the warehouse
    'custom-property-pattern': '^([A-Za-z0-9]*)([-_]+[A-Za-z0-9]+)*$',
    // There is a problem with judging the less function
    'less/no-duplicate-variables': null,
    'media-feature-range-notation': null,
    'max-nesting-depth': [
      3,
      {
        ignore: ['pseudo-classes'],
        ignoreRules: ['/:global/'],
        message: 'Expected nesting depth to be no more than 3.',
      },
    ],
    'plugin/disallow-first-level-global': true,
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*(_[a-z0-9]+)?$',
      {
        resolveNestedSelectors: true,
        message: 'Expected class pattern is $block-$element_$modifier.',
      },
    ],
    'declaration-no-important': true,
    'color-function-notation': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind'],
      },
    ],
  },
};
