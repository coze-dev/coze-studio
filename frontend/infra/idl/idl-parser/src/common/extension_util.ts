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

import {
  POSITIONS,
  SERIALIZERS,
  UPPERCASE_METHODS,
  LOWERCASE_METHODS,
  SERVICE_EXTENSTION_CONFIG_KEYS,
  FUNCTION_EXTENSTION_CONFIG_KEYS,
  FIELD_EXTENSTION_CONFIG_KEYS,
  type ExtensionConfig,
  type ExtensionConfigStringKey,
  type FieldExtensionConfig,
  type FunctionExtensionConfig,
  type ServiceExtensionConfig,
  type Serializer,
  type Method,
  type Position,
} from './extension_type';

const goJsonTagRegExp = /^\s*json:(\\?[',"])(.*?)\1/;

function getTag(newtag = '', inputStr = '') {
  const tags: string[] = [];
  if (inputStr.includes('omitempty')) {
    tags.push('omitempty');
  }

  if (inputStr.includes('required')) {
    tags.push('required');
  }

  if (inputStr === 'int2str') {
    tags.push('int2str');
  }

  if (tags.length === 0) {
    return newtag;
  }

  return newtag + (newtag.length > 0 ? ',' : '') + tags.join(',');
}

// NOTE: agw is a similar specification in Bytedance,
// so we should cover the agw specification here.
// some old rules should also be covered here.
// eslint-disable-next-line complexity
export function extractExtensionConfig(
  key: string,
  value: string,
  ignoreTag = false,
) {
  const config: ExtensionConfig = {};

  // an old rule: go.tag = "json:\"id,omitempty\""
  if (!ignoreTag && /^go\.tag/.test(key)) {
    const matches = value.match(goJsonTagRegExp);
    if (matches) {
      /* istanbul ignore next */
      const tagValues = (matches[2] || '').split(',');
      const tagKey = tagValues[0];

      /* istanbul ignore else */
      if (tagKey) {
        if (tagKey === '-') {
          config.tag = 'ignore';
        } else if (/^[a-zA-Z0-9_-]+$/.test(tagKey)) {
          config.key = tagKey;
        }
      }

      const extraInfos = tagValues.slice(1).map(item => item.trim());
      if (extraInfos.includes('string')) {
        config.value_type = 'string';
      }

      const newTag = getTag(config.tag, matches[2]);
      if (newTag) {
        config.tag = newTag;
      }
    }

    return config;
  }

  // the agw rules: agw.source = 'header' or agw.target = 'http_code'
  if (key === 'source' || key === 'target') {
    /* istanbul ignore else */
    if (value === 'http_code') {
      config.position = 'status_code';
    } else if (POSITIONS.includes(value)) {
      config.position = value as Position;
    }
  } else if (key === 'method') {
    // the agw rule: agw.method = 'POST|GET'
    const method = value.split('|')[0];
    if (UPPERCASE_METHODS.includes(method)) {
      config.method = method as Method;
    }
  } else if (key === 'position') {
    if (POSITIONS.includes(value)) {
      config.position = value as Position;
    }
  } else if (key === 'serializer') {
    if (SERIALIZERS.includes(value)) {
      config.serializer = value as Serializer;
    }
  } else if (LOWERCASE_METHODS.includes(key)) {
    config.method = key.toUpperCase() as Method;
    config.uri = value;
  } else if (POSITIONS.includes(key)) {
    config.position = key as Position;

    // cover an old rule: (api.body = "tags, omitempty")
    const parts = value.split(',');
    config.key = parts[0].trim().replace(/\[\]$/, '');
    const newTag = getTag(config.tag, value);
    if (newTag) {
      config.tag = newTag;
    }
  } else if (
    [
      'uri_prefix',
      'uri',
      'group',
      'custom',
      'version',
      'key',
      'web_type',
      'value_type',
      'tag',
    ].includes(key)
  ) {
    config[key as 'uri_prefix'] = value;
  } else if (key === 'req.headers') {
    // NOTE: Compliance with old specifications
    if (value.includes('x-www-form-urlencoded')) {
      config.serializer = 'urlencoded';
    } else if (value.includes('form-data')) {
      config.serializer = 'form';
    } else if (value.includes('json')) {
      config.serializer = 'json';
    }
  } else if (key === 'js_conv' && ['string', 'str', 'true'].includes(value)) {
    // NOTE: used in bytedance
    const newTag = getTag(config.tag, 'int2str');
    if (newTag) {
      config.tag = newTag;
    }
  }

  return config;
}

export function filterConfig(
  config: ExtensionConfig,
  keys: string[],
): ExtensionConfig {
  const filteredConfig: ExtensionConfig = {};
  Object.keys(config).forEach(key => {
    if (keys.includes(key)) {
      filteredConfig[key as ExtensionConfigStringKey] =
        config[key as ExtensionConfigStringKey];
    }
  });

  return filteredConfig;
}

export function filterFieldExtensionConfig(config: ExtensionConfig) {
  return filterConfig(
    config,
    FIELD_EXTENSTION_CONFIG_KEYS,
  ) as FieldExtensionConfig;
}

export function filterFunctionExtensionConfig(config: ExtensionConfig) {
  return filterConfig(
    config,
    FUNCTION_EXTENSTION_CONFIG_KEYS,
  ) as FunctionExtensionConfig;
}

export function filterServiceExtensionConfig(config: ExtensionConfig) {
  return filterConfig(
    config,
    SERVICE_EXTENSTION_CONFIG_KEYS,
  ) as ServiceExtensionConfig;
}
